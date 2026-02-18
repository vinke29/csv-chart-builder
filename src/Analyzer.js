import Papa from 'papaparse'

const EMPTY_VALUES = new Set(['', '-', 'n/a', 'N/A', 'null', 'NULL', 'na', 'NA', 'none', 'None'])

function cleanValue(val) {
  if (val === null || val === undefined) return null
  let v = String(val).trim()
  if (EMPTY_VALUES.has(v)) return null
  // Strip currency/percent symbols and thousands commas
  const cleaned = v.replace(/[$€£%]/g, '').replace(/,(?=\d{3})/g, '')
  if (cleaned !== v) return isNaN(Number(cleaned)) ? v : Number(cleaned)
  return v
}

function detectType(values) {
  const nonNull = values.filter(v => v !== null)
  if (nonNull.length === 0) return 'text'

  const numericCount = nonNull.filter(v => typeof v === 'number' || !isNaN(Number(v))).length
  if (numericCount / nonNull.length > 0.8) return 'numeric'

  const dateCount = nonNull.filter(v => !isNaN(Date.parse(String(v)))).length
  if (dateCount / nonNull.length > 0.8) return 'date'

  const uniqueCount = new Set(nonNull.map(String)).size
  if (uniqueCount <= 20 || uniqueCount / nonNull.length < 0.5) return 'categorical'

  return 'text'
}

export function parseAndClean(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (!results.data || results.data.length < 2) {
          return reject(new Error('NOT_ENOUGH_DATA'))
        }
        if (Object.keys(results.data[0]).length < 2) {
          return reject(new Error('NOT_ENOUGH_COLUMNS'))
        }

        let rows = results.data
        const truncated = rows.length > 5000
        if (truncated) rows = rows.slice(0, 5000)

        // Clean all values
        const cleaned = rows.map(row => {
          const out = {}
          for (const [k, v] of Object.entries(row)) {
            out[k.trim()] = cleanValue(v)
          }
          return out
        })

        // Detect column types
        const columnNames = Object.keys(cleaned[0])
        const columns = columnNames.map(name => {
          const vals = cleaned.map(r => r[name])
          return { name, type: detectType(vals) }
        })

        resolve({ rows: cleaned, columns, truncated })
      },
      error(err) {
        reject(new Error('PARSE_ERROR: ' + err.message))
      },
    })
  })
}

function sampleRows(rows, n = 20) {
  if (rows.length <= n) return rows
  const step = Math.floor(rows.length / n)
  return Array.from({ length: n }, (_, i) => rows[i * step])
}

export async function analyzeWithClaude(rows, columns) {
  const sample = sampleRows(rows, 20)

  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns, rows: sample }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (body.error === 'NO_API_KEY') throw new Error('NO_API_KEY')
    throw new Error(`CLAUDE_API_ERROR: ${res.status}`)
  }

  return res.json()
}
