import {
  ScatterChart as ReScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { COLORS, axisStyle, gridStyle, tooltipStyle } from './theme'

export default function ScatterChart({ data, spec }) {
  const points = data.map(row => ({ x: row[spec.x], y: row[spec.y] }))
  return (
    <ResponsiveContainer width="100%" height={420}>
      <ReScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
        <CartesianGrid {...gridStyle} />
        <XAxis type="number" dataKey="x" name={spec.x} {...axisStyle} label={{ value: spec.x_label, position: 'insideBottom', offset: -15, fill: '#6e7681', fontSize: 12 }} />
        <YAxis type="number" dataKey="y" name={spec.y} {...axisStyle} label={{ value: spec.y_label, angle: -90, position: 'insideLeft', fill: '#6e7681', fontSize: 12 }} />
        <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: '4 4', stroke: '#30363d' }} />
        <Scatter data={points} fill={COLORS[4]} fillOpacity={0.7} />
      </ReScatterChart>
    </ResponsiveContainer>
  )
}
