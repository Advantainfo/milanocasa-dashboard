"use client"

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/format"

// Money-terminal green/red pair for polarity (above/below the zero
// baseline), re-validated with the dataviz skill's script against these
// exact surfaces - see revenue-expenses-chart.tsx for the same pair used
// as a categorical series identity there.
const POSITIVE_COLOR = "var(--color-positive)"
const NEGATIVE_COLOR = "var(--color-negative)"

const chartConfig = {
  positive: { label: "Positive", theme: { light: "#00703d", dark: "#00994d" } },
  negative: { label: "Negative", theme: { light: "#c81e3a", dark: "#ff2d55" } },
} satisfies ChartConfig

interface DivergingBarChartProps {
  title: string
  description: string
  valueLabel: string
  data: Array<{ monthLabel: string; value: string }>
}

export function DivergingBarChart({
  title,
  description,
  valueLabel,
  data,
}: DivergingBarChartProps) {
  const chartData = data.map((point) => ({
    monthLabel: point.monthLabel,
    [valueLabel]: Number(point.value),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: POSITIVE_COLOR }}
            />
            <span className="text-muted-foreground">Positive</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: NEGATIVE_COLOR }}
            />
            <span className="text-muted-foreground">Negative</span>
          </span>
        </div>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid
              vertical={false}
              strokeDasharray="0"
              className="stroke-border/50"
            />
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
            <Bar dataKey={valueLabel} radius={[4, 4, 4, 4]} maxBarSize={24}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={Number(entry[valueLabel]) >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
