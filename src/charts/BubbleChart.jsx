import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, axisStyle, gridStyle, tooltipStyle } from './theme'

export default function BubbleChart({ data, spec }) {
  // If there's a color column, group data by it
  const colorKey = spec.color

  function buildGroups() {
    if (!colorKey) {
      return [{
        name: spec.y,
        data: data.map(r => ({ x: r[spec.x], y: r[spec.y], z: r[spec.size] ?? 1 })),
        color: COLORS[0],
      }]
    }
    const groups = {}
    data.forEach(r => {
      const g = String(r[colorKey] ?? 'Other')
      if (!groups[g]) groups[g] = []
      groups[g].push({ x: r[spec.x], y: r[spec.y], z: r[spec.size] ?? 1 })
    })
    return Object.entries(groups).map(([name, pts], i) => ({ name, data: pts, color: COLORS[i % COLORS.length] }))
  }

  const groups = buildGroups()
  const allZ = data.map(r => r[spec.size]).filter(v => v != null && !isNaN(v))
  const maxZ = allZ.length ? Math.max(...allZ) : 1
  // scale range so area represents value (scaleSqrt equivalent)
  const zRange = [10, Math.min(60, Math.max(20, Math.sqrt(maxZ / (data.length || 1)) * 40))]

  return (
    <ResponsiveContainer width="100%" height={420}>
      <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
        <CartesianGrid {...gridStyle} />
        <XAxis type="number" dataKey="x" name={spec.x} {...axisStyle} label={{ value: spec.x_label, position: 'insideBottom', offset: -15, fill: '#6e7681', fontSize: 12 }} />
        <YAxis type="number" dataKey="y" name={spec.y} {...axisStyle} label={{ value: spec.y_label, angle: -90, position: 'insideLeft', fill: '#6e7681', fontSize: 12 }} />
        <ZAxis type="number" dataKey="z" range={zRange} name={spec.size ?? 'size'} />
        <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: '4 4', stroke: '#30363d' }} />
        {groups.length > 1 && <Legend wrapperStyle={{ color: '#8b949e', fontSize: 12, paddingTop: 12 }} />}
        {groups.map(g => (
          <Scatter key={g.name} name={g.name} data={g.data} fill={g.color} fillOpacity={0.7} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
