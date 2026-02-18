export const COLORS = ['#e05c5c', '#e8943a', '#d4c44a', '#4caf6e', '#4a90d9', '#a78bfa', '#f472b6']

export function getChartTheme(t) {
  return {
    axisStyle: {
      tick: { fill: t.axisColor, fontSize: 12 },
      axisLine: { stroke: t.gridColor },
      tickLine: { stroke: t.gridColor },
    },
    gridStyle: {
      strokeDasharray: '4 4',
      stroke: t.gridColor,
      vertical: false,
    },
    tooltipStyle: {
      contentStyle: {
        backgroundColor: t.tooltipBg,
        border: `1px solid ${t.tooltipBorder}`,
        borderRadius: 8,
        color: t.tooltipColor,
        fontSize: 13,
      },
      labelStyle: { color: t.tooltipColor },
      itemStyle: { color: t.tooltipColor },
      cursor: { fill: t.cursorFill },
    },
  }
}
