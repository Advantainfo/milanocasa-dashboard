"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export interface AreaTrendSeries {
  key: string
  label: string
  /** Any valid CSS color value, e.g. "var(--chart-1)" or "#f59e0b". */
  color: string
}

interface AreaTrendChartProps<TData extends object> {
  data: TData[]
  categoryKey: string
  series: AreaTrendSeries[]
  valueFormatter?: (value: number) => string
  height?: number
}

/** Generic gradient-filled area trend chart, reused for revenue/expenses and cash-flow. */
export function AreaTrendChart<TData extends object>({
  data,
  categoryKey,
  series,
  valueFormatter = (n) => n.toLocaleString(),
  height = 280,
}: AreaTrendChartProps<TData>) {
  const chartConfig = series.reduce<ChartConfig>((config, item) => {
    config[item.key] = { label: item.label, color: item.color }
    return config
  }, {})

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          {series.map((item) => (
            <linearGradient key={item.key} id={`fill-${item.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={item.color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={item.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="0" className="stroke-border/50" />
        <XAxis
          dataKey={categoryKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="text-foreground font-mono font-medium tabular-nums">
                    {valueFormatter(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((item) => (
          <Area
            key={item.key}
            dataKey={item.key}
            type="monotone"
            stroke={item.color}
            strokeWidth={2}
            fill={`url(#fill-${item.key})`}
            animationDuration={700}
            activeDot={{ r: 4 }}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}
