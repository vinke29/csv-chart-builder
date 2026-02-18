import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, axisStyle, gridStyle, tooltipStyle } from './theme'

function BubbleLabel({ cx, cy, name }) {
  if (!name) return null
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={11} fontWeight={500} style={{ pointerEvents: 'none' }}>
      {name.length > 6 ? name.slice(0, 5) + '…' : name}
    </text>
  )
}

export default function BubbleChart({ data, spec }) {
  const colorKey = spec.color

  function buildGroups() {
    if (!colorKey) {
      return [{
        name: null,
        data: data.map(r => ({ x: r[spec.x], y: r[spec.y], z: r[spec.size] ?? 1, label: null })),
        color: COLORS[0],
      }]
    }
    const groups = {}
    data.forEach(r => {
      const g = String(r[colorKey] ?? 'Other')
      if (!groups[g]) groups[g] = []
      groups[g].push({ x: r[spec.x], y: r[spec.y], z: r[spec.size] ?? 1, label: g })
    })
    return Object.entries(groups).map(([name, pts], i) => ({ name, data: pts, color: COLORS[i % COLORS.length] }))
  }

  const groups = buildGroups()
  const allZ = data.map(r => r[spec.size]).filter(v => v != null && !isNaN(v))
  const minZ = allZ.length ? Math.min(...allZ) : 1
  const maxZ = allZ.length ? Math.max(...allZ) : 1
  const spread = maxZ / (minZ || 1)
  const maxArea = spread > 50 ? 1200 : spread > 10 ? 2000 : 3000
  const zRange = [100, maxArea]

  return (
    <ResponsiveContainer width="100%" height={460}>
      <ScatterChart margin={{ top: 60, right: 60, left: 10, bottom: 60 }}>
        <CartesianGrid {...gridStyle} />
        <XAxis
          type="number"
          dataKey="x"
          name={spec.x}
          {...axisStyle}
          label={{ value: spec.x_label, position: 'insideBottom', offset: -40, fill: '#6e7681', fontSize: 12 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={spec.y}
          {...axisStyle}
          label={{ value: spec.y_label, angle: -90, position: 'insideLeft', fill: '#6e7681', fontSize: 12 }}
        />
        <ZAxis type="number" dataKey="z" range={zRange} name={spec.size ?? 'size'} />
        <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: '4 4', stroke: '#30363d' }} />
        {groups.length > 1 && (
          <Legend wrapperStyle={{ color: '#8b949e', fontSize: 12, paddingTop: 8, marginTop: 8 }} />
        )}
        {groups.map(g => (
          <Scatter
            key={g.name}
            name={g.name}
            data={g.data}
            fill={g.color}
            fillOpacity={0.7}
            label={<BubbleLabel />}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
