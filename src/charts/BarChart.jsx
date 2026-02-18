import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { COLORS, getChartTheme } from './theme'
import { useTheme } from '../ThemeContext'

export default function BarChart({ data, spec }) {
  const { t } = useTheme()
  const { axisStyle, gridStyle, tooltipStyle } = getChartTheme(t)
  return (
    <ResponsiveContainer width="100%" height={420}>
      <ReBarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey={spec.x} {...axisStyle} angle={-35} textAnchor="end" interval="preserveStartEnd" label={{ value: spec.x_label, position: 'insideBottom', offset: -45, fill: t.axisColor, fontSize: 12 }} />
        <YAxis {...axisStyle} label={{ value: spec.y_label, angle: -90, position: 'insideLeft', fill: t.axisColor, fontSize: 12 }} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={spec.y} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  )
}
