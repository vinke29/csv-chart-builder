import { useRef, useState } from 'react'

const constraints = [
  'First row must be column headers',
  'At least 2 columns and 2 rows required',
  'No merged cells, multi-row headers, or summary rows',
  'Numeric columns may contain $, €, £, % — these will be stripped automatically',
  'Dates should use a consistent format throughout the column',
  'UTF-8 encoding (default for Excel, Google Sheets exports)',
  'Max ~5,000 rows (larger files will be truncated)',
]

export default function Upload({ onFile, error }) {
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ backgroundColor: '#0d1117' }}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">CSV Chart Builder</h1>
          <p className="text-sm" style={{ color: '#6e7681' }}>
            Upload a CSV and Claude will recommend the best chart for your data.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="cursor-pointer rounded-xl border-2 border-dashed transition-colors duration-150 flex flex-col items-center justify-center py-16 px-8 mb-6"
          style={{
            borderColor: dragging ? '#4a90d9' : '#30363d',
            backgroundColor: dragging ? 'rgba(74,144,217,0.06)' : '#161b22',
          }}
        >
          <svg className="w-12 h-12 mb-4" style={{ color: '#6e7681' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-white font-medium mb-1">Drag & drop your CSV here</p>
          <p className="text-sm" style={{ color: '#6e7681' }}>or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(224,92,92,0.12)', color: '#e05c5c', border: '1px solid rgba(224,92,92,0.3)' }}>
            {error}
          </div>
        )}

        {/* Constraints */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6e7681' }}>CSV Requirements</p>
          <ul className="space-y-2">
            {constraints.map(c => (
              <li key={c} className="flex items-start gap-2 text-sm" style={{ color: '#8b949e' }}>
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
