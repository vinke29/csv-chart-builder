import {
  PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, tooltipStyle } from './theme'

export default function PieChart({ data, spec }) {
  // Aggregate by x, summing y
  const agg = {}
  data.forEach(row => {
    const key = String(row[spec.x] ?? 'Other')
    agg[key] = (agg[key] ?? 0) + (Number(row[spec.y]) || 0)
  })
  const pieData = Object.entries(agg).map(([name, value]) => ({ name, value }))

  return (
    <ResponsiveContainer width="100%" height={420}>
      <RePieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
          labelLine={{ stroke: '#6e7681' }}
        >
          {pieData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ color: '#8b949e', fontSize: 12 }} />
      </RePieChart>
    </ResponsiveContainer>
  )
}
