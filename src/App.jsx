import { useState } from 'react'
import Upload from './Upload'
import ChartRenderer from './ChartRenderer'
import Controls from './Controls'
import { parseAndClean, analyzeWithClaude } from './Analyzer'

const SCREEN = { UPLOAD: 'upload', LOADING: 'loading', RESULTS: 'results' }

function LoadingScreen({ step }) {
  const steps = ['Parsing CSV', 'Asking Claude to analyze']
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ backgroundColor: '#0d1117' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: '#4a90d9', borderTopColor: 'transparent' }} />
        <p className="text-white font-medium">Analyzing your data…</p>
      </div>
      <div className="flex gap-3">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full" style={{
            backgroundColor: step > i ? 'rgba(76,175,110,0.15)' : step === i ? 'rgba(74,144,217,0.15)' : '#161b22',
            color: step > i ? '#4caf6e' : step === i ? '#4a90d9' : '#6e7681',
            border: `1px solid ${step > i ? 'rgba(76,175,110,0.3)' : step === i ? 'rgba(74,144,217,0.3)' : '#21262d'}`,
          }}>
            {step > i ? '✓ ' : ''}{s}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState(SCREEN.UPLOAD)
  const [loadingStep, setLoadingStep] = useState(0)
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
    setLoadingStep(0)

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

    setLoadingStep(1)
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
        setAnalysisError('No API key found. Add your key to the .env file and restart the dev server. Showing manual controls below.')
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
    setLoadingStep(0)
  }

  if (screen === SCREEN.UPLOAD) return <Upload onFile={handleFile} error={uploadError} />
  if (screen === SCREEN.LOADING) return <LoadingScreen step={loadingStep} />

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">{spec.title || 'Chart'}</h1>
          {truncated && (
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(232,148,58,0.15)', color: '#e8943a', border: '1px solid rgba(232,148,58,0.3)' }}>
              Dataset truncated to 5,000 rows
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {analysisError && (
              <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(232,148,58,0.12)', color: '#e8943a', border: '1px solid rgba(232,148,58,0.3)' }}>
                {analysisError}
              </div>
            )}

            <div className="rounded-xl p-4" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
              <ChartRenderer data={data} spec={spec} />
            </div>

            {spec.reasoning && (
              <div className="mt-4 rounded-xl px-5 py-4 flex gap-3" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
                <span className="text-lg shrink-0">💡</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6e7681' }}>Claude's Reasoning</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#8b949e' }}>{spec.reasoning}</p>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-64 shrink-0">
            <Controls spec={spec} columns={columns} onSpecChange={setSpec} onReset={reset} />
          </div>
        </div>
      </div>
    </div>
  )
}
