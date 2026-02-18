import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { COLORS, getChartTheme } from './theme'
import { useTheme } from '../ThemeContext'

export default function PieChart({ data, spec }) {
  const { t } = useTheme()
  const { tooltipStyle } = getChartTheme(t)
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
          labelLine={{ stroke: t.axisColor }}
        >
          {pieData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ color: t.textMuted, fontSize: 12 }} />
      </RePieChart>
    </ResponsiveContainer>
  )
}
