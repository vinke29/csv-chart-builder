import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { COLORS, getChartTheme } from './theme'
import { useTheme } from '../ThemeContext'

export default function GroupedBarChart({ data, spec }) {
  const { t } = useTheme()
  const { axisStyle, gridStyle, tooltipStyle } = getChartTheme(t)
  const yKeys = [spec.y, spec.y2].filter(Boolean)
  return (
    <ResponsiveContainer width="100%" height={420}>
      <ReBarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey={spec.x} {...axisStyle} angle={-35} textAnchor="end" interval="preserveStartEnd" label={{ value: spec.x_label, position: 'insideBottom', offset: -45, fill: t.axisColor, fontSize: 12 }} />
        <YAxis {...axisStyle} label={{ value: spec.y_label, angle: -90, position: 'insideLeft', fill: t.axisColor, fontSize: 12 }} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ color: t.textMuted, fontSize: 12, paddingTop: 12 }} />
        {yKeys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  )
}
