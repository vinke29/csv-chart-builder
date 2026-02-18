import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { COLORS, getChartTheme } from './theme'
import { useTheme } from '../ThemeContext'

function BubbleShape(props) {
  const { cx, cy, r, fill, payload } = props
  const name = payload?.groupName
  const radius = r ?? 8
  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill={fill} fillOpacity={0.75} />
      {name && (
        <text
          x={cx}
          y={cy - radius - 5}
          textAnchor="middle"
          fill={fill}
          fontSize={11}
          fontWeight={600}
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
      )}
    </g>
  )
}

function BubbleTooltip({ active, payload, t, spec }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div style={{ backgroundColor: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: t.tooltipColor, lineHeight: 1.7 }}>
      {point.groupName && <p style={{ fontWeight: 700, marginBottom: 4 }}>{point.groupName}</p>}
      <p>{spec.x}: {point.x}</p>
      <p>{spec.y}: {point.y}</p>
      {spec.size && <p>{spec.size}: {point.z}</p>}
    </div>
  )
}

export default function BubbleChart({ data, spec }) {
  const { t } = useTheme()
  const { axisStyle, gridStyle } = getChartTheme(t)
  const colorKey = spec.color

  function buildGroups() {
    if (!colorKey) {
      return [{
        name: null,
        data: data.map(r => ({ x: r[spec.x], y: r[spec.y], z: r[spec.size] ?? 1, groupName: null })),
        color: COLORS[0],
      }]
    }
    const groups = {}
    data.forEach(r => {
      const g = String(r[colorKey] ?? 'Other')
      if (!groups[g]) groups[g] = []
      groups[g].push({ x: r[spec.x], y: r[spec.y], z: r[spec.size] ?? 1, groupName: g })
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
        <XAxis type="number" dataKey="x" name={spec.x} {...axisStyle} label={{ value: spec.x_label, position: 'insideBottom', offset: -40, fill: t.axisColor, fontSize: 12 }} />
        <YAxis type="number" dataKey="y" name={spec.y} {...axisStyle} label={{ value: spec.y_label, angle: -90, position: 'insideLeft', fill: t.axisColor, fontSize: 12 }} />
        <ZAxis type="number" dataKey="z" range={zRange} name={spec.size ?? 'size'} />
        <Tooltip content={<BubbleTooltip t={t} spec={spec} />} cursor={{ strokeDasharray: '4 4', stroke: t.border2 }} />
        {groups.length > 1 && <Legend wrapperStyle={{ color: t.textMuted, fontSize: 12, paddingTop: 8 }} />}
        {groups.map((g, i) => (
          <Scatter
            key={g.name}
            name={g.name}
            data={g.data}
            fill={g.color}
            shape={<BubbleShape fill={g.color} />}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
