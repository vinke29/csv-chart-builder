import BarChart from './charts/BarChart'
import GroupedBarChart from './charts/GroupedBarChart'
import LineChart from './charts/LineChart'
import ScatterChart from './charts/ScatterChart'
import BubbleChart from './charts/BubbleChart'
import HistogramChart from './charts/HistogramChart'
import PieChart from './charts/PieChart'

const CHART_MAP = {
  bar: BarChart,
  grouped_bar: GroupedBarChart,
  line: LineChart,
  scatter: ScatterChart,
  bubble: BubbleChart,
  histogram: HistogramChart,
  pie: PieChart,
}

export default function ChartRenderer({ data, spec }) {
  const Component = CHART_MAP[spec.chart_type] ?? BarChart
  return <Component data={data} spec={spec} />
}
