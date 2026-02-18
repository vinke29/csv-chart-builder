import { useRef, useState } from 'react'
import { useTheme } from './ThemeContext'

const constraints = [
  'First row must be column headers',
  'At least 2 columns and 2 rows required',
  'No merged cells, multi-row headers, or summary rows',
  'Numeric columns may contain $, €, £, % — these will be stripped automatically',
  'Dates should use a consistent format throughout the column',
  'UTF-8 encoding (default for Excel, Google Sheets exports)',
  'Max ~5,000 rows (larger files will be truncated)',
]

function ThemeToggle() {
  const { isDark, toggle, t } = useTheme()
  return (
    <button onClick={toggle} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className="rounded-lg p-2 transition-colors" style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, color: t.textMuted }}>
      {isDark
        ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" /></svg>
        : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
      }
    </button>
  )
}

export default function Upload({ onFile, error }) {
  const { t } = useTheme()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file) {
    if (!file) return
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      onFile(null, 'Please upload a CSV file.')
      return
    }
    onFile(file)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ backgroundColor: t.bg }}>
      <div className="w-full max-w-2xl">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: t.text }}>CSV Chart Builder</h1>
            <p className="text-sm" style={{ color: t.textSubtle }}>Upload a CSV and Claude will recommend the best chart for your data.</p>
          </div>
          <ThemeToggle />
        </div>

        <div
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="cursor-pointer rounded-xl border-2 border-dashed transition-colors duration-150 flex flex-col items-center justify-center py-16 px-8 mb-6"
          style={{ borderColor: dragging ? '#4a90d9' : t.border, backgroundColor: dragging ? 'rgba(74,144,217,0.06)' : t.card }}
        >
          <svg className="w-12 h-12 mb-4" style={{ color: t.textSubtle }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="font-medium mb-1" style={{ color: t.text }}>Drag & drop your CSV here</p>
          <p className="text-sm" style={{ color: t.textSubtle }}>or click to browse</p>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>

        {error && (
          <div className="mb-6 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(224,92,92,0.12)', color: '#e05c5c', border: '1px solid rgba(224,92,92,0.3)' }}>
            {error}
          </div>
        )}

        <div className="rounded-xl p-5" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: t.textSubtle }}>CSV Requirements</p>
          <ul className="space-y-2">
            {constraints.map(c => (
              <li key={c} className="flex items-start gap-2 text-sm" style={{ color: t.textMuted }}>
                <span className="mt-0.5 shrink-0" style={{ color: '#4caf6e' }}>✓</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
