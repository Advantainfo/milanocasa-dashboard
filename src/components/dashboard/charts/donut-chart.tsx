"use client"

import { Cell, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export interface DonutSlice {
  key: string
  label: string
  value: number
  /** Any valid CSS color value, e.g. "var(--chart-1)" or "#f59e0b". */
  color: string
}

interface DonutChartProps {
  data: DonutSlice[]
  centerLabel?: string
  centerValue?: string
  valueFormatter?: (value: number) => string
  height?: number
}

/** Generic donut chart with a centered total label and a compact legend, reused for
 *  compositional KPIs (e.g. collected vs. outstanding). */
export function DonutChart({
  data,
  centerLabel,
  centerValue,
  valueFormatter = (n) => n.toLocaleString(),
  height = 200,
}: DonutChartProps) {
  const chartConfig = data.reduce<ChartConfig>((config, slice) => {
    config[slice.key] = { label: slice.label, color: slice.color }
    return config
  }, {})

  const total = data.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <div className="w-full space-y-4">
      <div className="relative mx-auto" style={{ height }}>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
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
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={3}
              strokeWidth={0}
              animationDuration={700}
            >
              {data.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        {(centerLabel || centerValue) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <span className="font-mono text-xl font-semibold tabular-nums">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-muted-foreground text-xs">{centerLabel}</span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {data.map((slice) => (
          <div key={slice.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-muted-foreground">{slice.label}</span>
            <span className="font-mono font-medium tabular-nums">
              {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
