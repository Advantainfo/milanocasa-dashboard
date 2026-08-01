"use client"

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/format"
import { useDictionary } from "@/lib/i18n/dictionary-provider"
import { DashboardSection } from "@/components/dashboard/dashboard-section"

// Money-terminal green/red pair for polarity (above/below the zero
// baseline), re-validated with the dataviz skill's script against these
// exact surfaces - see area-trend-chart.tsx for the same pair used
// as a categorical series identity there.
const POSITIVE_COLOR = "var(--color-positive)"
const NEGATIVE_COLOR = "var(--color-negative)"

interface DivergingBarChartProps {
  title: string
  description: string
  valueLabel: string
  data: Array<{ monthLabel: string; value: string }>
  height?: number
}

export function DivergingBarChart({
  title,
  description,
  valueLabel,
  data,
  height = 220,
}: DivergingBarChartProps) {
  const dict = useDictionary()

  const chartConfig = {
    positive: {
      label: dict.dashboard.charts.positive,
      theme: { light: "#00703d", dark: "#00994d" },
    },
    negative: {
      label: dict.dashboard.charts.negative,
      theme: { light: "#c81e3a", dark: "#ff2d55" },
    },
  } satisfies ChartConfig

  const chartData = data.map((point) => ({
    monthLabel: point.monthLabel,
    [valueLabel]: Number(point.value),
  }))

  return (
    <DashboardSection title={title} description={description} className="h-full">
      <div className="mb-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: POSITIVE_COLOR }} />
          <span className="text-muted-foreground">{dict.dashboard.charts.positive}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: NEGATIVE_COLOR }} />
          <span className="text-muted-foreground">{dict.dashboard.charts.negative}</span>
        </span>
      </div>
      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <BarChart data={chartData} barCategoryGap="24%">
          <CartesianGrid vertical={false} strokeDasharray="0" className="stroke-border/50" />
          <XAxis
            dataKey="monthLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs"
          />
          <ReferenceLine y={0} className="stroke-border" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="line"
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-muted-foreground">{name}</span>
                    <span className="text-foreground font-mono font-medium tabular-nums">
                      {formatCurrency(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar dataKey={valueLabel} radius={[6, 6, 6, 6]} maxBarSize={22} animationDuration={700}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={Number(entry[valueLabel]) >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </DashboardSection>
  )
}
