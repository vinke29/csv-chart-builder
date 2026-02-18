import { useState } from 'react'
import Upload from './Upload'
import ChartRenderer from './ChartRenderer'
import Controls from './Controls'
import { parseAndClean, analyzeWithClaude } from './Analyzer'
import { useTheme } from './ThemeContext'

const SCREEN = { UPLOAD: 'upload', LOADING: 'loading', RESULTS: 'results' }

function ThemeToggle() {
  const { isDark, toggle, t } = useTheme()
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-lg p-2 transition-colors"
      style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, color: t.textMuted }}
    >
      {isDark ? (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" /></svg>
      ) : (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
      )}
    </button>
  )
}

function LoadingScreen() {
  const { t } = useTheme()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ backgroundColor: t.bg }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: '#4a90d9', borderTopColor: 'transparent' }} />
        <p className="font-medium" style={{ color: t.text }}>Analyzing your data…</p>
        <p className="text-sm" style={{ color: t.textSubtle }}>Charging $2.99 to Dr. Dang…</p>
      </div>
    </div>
  )
}

export default function App() {
  const { t } = useTheme()
  const [screen, setScreen] = useState(SCREEN.UPLOAD)
  const [data, setData] = useState(null)
  const [columns, setColumns] = useState([])
  const [spec, setSpec] = useState(null)
  const [truncated, setTruncated] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [analysisError, setAnalysisError] = useState(null)

  async function handleFile(file, errMsg) {
    if (errMsg) { setUploadError(errMsg); return }
    setUploadError(null)
    setScreen(SCREEN.LOADING)

    let parsed
    try {
      parsed = await parseAndClean(file)
    } catch (err) {
      setScreen(SCREEN.UPLOAD)
      if (err.message === 'NOT_ENOUGH_DATA' || err.message === 'NOT_ENOUGH_COLUMNS') {
        setUploadError('This dataset needs at least 2 columns and 2 rows to visualize.')
      } else {
        setUploadError("We couldn't read this file. Check that it has a header row and is UTF-8 encoded.")
      }
      return
    }

    setTruncated(parsed.truncated)

    let chartSpec
    try {
      chartSpec = await analyzeWithClaude(parsed.rows, parsed.columns)
    } catch (err) {
      chartSpec = {
        chart_type: 'bar',
        x: parsed.columns[0]?.name,
        y: parsed.columns[1]?.name,
        y2: null, size: null, color: null,
        title: 'Chart',
        x_label: parsed.columns[0]?.name ?? '',
        y_label: parsed.columns[1]?.name ?? '',
        reasoning: null,
      }
      if (err.message === 'NO_API_KEY') {
        setAnalysisError('No API key found. Add your key to the .env file and restart the dev server.')
      } else {
        setAnalysisError('Analysis failed. You can pick a chart type manually below.')
      }
    }

    setData(parsed.rows)
    setColumns(parsed.columns)
    setSpec(chartSpec)
    setScreen(SCREEN.RESULTS)
  }

  function reset() {
    setScreen(SCREEN.UPLOAD)
    setData(null)
    setColumns([])
    setSpec(null)
    setTruncated(false)
    setAnalysisError(null)
    setUploadError(null)
  }

  if (screen === SCREEN.UPLOAD) return <Upload onFile={handleFile} error={uploadError} />
  if (screen === SCREEN.LOADING) return <LoadingScreen />

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: t.bg }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: t.text }}>{spec.title || 'Chart'}</h1>
          <div className="flex items-center gap-3">
            {truncated && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(232,148,58,0.15)', color: '#e8943a', border: '1px solid rgba(232,148,58,0.3)' }}>
                Dataset truncated to 5,000 rows
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {analysisError && (
              <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(232,148,58,0.12)', color: '#e8943a', border: '1px solid rgba(232,148,58,0.3)' }}>
                {analysisError}
              </div>
            )}
            <div className="rounded-xl p-4" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
              <ChartRenderer data={data} spec={spec} />
            </div>
          </div>

          <div className="w-full lg:w-64 shrink-0">
            <Controls spec={spec} columns={columns} onSpecChange={setSpec} onReset={reset} />
          </div>
        </div>
      </div>
    </div>
  )
}
