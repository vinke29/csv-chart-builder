import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { COLORS, axisStyle, gridStyle, tooltipStyle } from './theme'

function buildBins(data, key, binCount = 20) {
  const vals = data.map(r => Number(r[key])).filter(v => !isNaN(v))
  if (!vals.length) return []
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const binWidth = (max - min) / binCount || 1
  const bins = Array.from({ length: binCount }, (_, i) => ({
    range: `${(min + i * binWidth).toFixed(1)}`,
    count: 0,
  }))
  vals.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / binWidth), binCount - 1)
    bins[idx].count++
  })
  return bins
}

export default function HistogramChart({ data, spec }) {
  const bins = buildBins(data, spec.x)
  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart data={bins} margin={{ top: 20, right: 30, left: 10, bottom: 60 }} barCategoryGap={1}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey="range" {...axisStyle} angle={-35} textAnchor="end" interval={2} label={{ value: spec.x_label, position: 'insideBottom', offset: -45, fill: '#6e7681', fontSize: 12 }} />
        <YAxis {...axisStyle} label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#6e7681', fontSize: 12 }} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="count" fill={COLORS[4]} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
