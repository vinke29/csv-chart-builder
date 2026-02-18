import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, axisStyle, gridStyle, tooltipStyle } from './theme'

export default function BarChart({ data, spec }) {
  return (
    <ResponsiveContainer width="100%" height={420}>
      <ReBarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey={spec.x} {...axisStyle} angle={-35} textAnchor="end" interval="preserveStartEnd" label={{ value: spec.x_label, position: 'insideBottom', offset: -45, fill: '#6e7681', fontSize: 12 }} />
        <YAxis {...axisStyle} label={{ value: spec.y_label, angle: -90, position: 'insideLeft', fill: '#6e7681', fontSize: 12 }} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={spec.y} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  )
}
