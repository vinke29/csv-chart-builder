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
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('NO_API_KEY')
  }

  const columnsAndTypes = columns.map(c => `${c.name} (${c.type})`).join(', ')
  const sample = sampleRows(rows, 20)

  const prompt = `You are a data visualization expert. Analyze this dataset and recommend the best chart type.

Columns and types:
${columnsAndTypes}

Sample rows (up to 20):
${JSON.stringify(sample, null, 2)}

Return ONLY a valid JSON object with this exact structure:
{
  "chart_type": "bar" | "line" | "scatter" | "bubble" | "histogram" | "grouped_bar" | "pie",
  "x": "column name for x-axis",
  "y": "column name for y-axis (primary)",
  "y2": "column name for second y-axis or null",
  "size": "column name to encode as bubble size or null",
  "color": "column name to encode as color/grouping or null",
  "title": "suggested chart title",
  "x_label": "x-axis label",
  "y_label": "y-axis label",
  "reasoning": "2-3 sentence explanation of why this chart type was chosen"
}

Rules:
- Prefer bar charts for categorical vs numeric comparisons
- Prefer line charts when one axis is a date/time
- Prefer scatter or bubble charts when there are 2+ numeric columns worth comparing
- Prefer histogram for single numeric column distributions
- Only suggest pie chart if there are fewer than 7 categories and they sum to a meaningful whole
- Be specific about which columns to use — use exact column names from the dataset`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`CLAUDE_API_ERROR: ${res.status} ${body}`)
  }

  const json = await res.json()
  const text = json.content[0].text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(text)
  } catch {
    throw new Error('CLAUDE_PARSE_ERROR')
  }
}
