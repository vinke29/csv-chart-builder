export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'NO_API_KEY' })
  }

  const { columns, rows } = req.body

  const columnsAndTypes = columns.map(c => `${c.name} (${c.type})`).join(', ')

  const prompt = `You are a data visualization expert. Analyze this dataset and recommend the best chart type.

Columns and types:
${columnsAndTypes}

Sample rows (up to 20):
${JSON.stringify(rows, null, 2)}

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

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      return res.status(502).json({ error: `Claude API error: ${response.status}`, detail: body })
    }

    const json = await response.json()
    const text = json.content[0].text.replace(/```json|```/g, '').trim()
    const spec = JSON.parse(text)
    return res.status(200).json(spec)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
