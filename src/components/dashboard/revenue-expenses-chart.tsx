"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/format"
import type { MonthlyFinancials } from "@/server/repositories/dashboard.repo"

// Categorical slots 1 (blue) and 2 (orange) from the validated dataviz palette -
// adjacent pair, passes CVD separation in both light and dark.
const chartConfig = {
  revenue: {
    label: "Revenue",
    theme: { light: "#2a78d6", dark: "#3987e5" },
  },
  expenses: {
    label: "Expenses",
    theme: { light: "#eb6834", dark: "#d95926" },
  },
} satisfies ChartConfig

interface RevenueExpensesChartProps {
  data: MonthlyFinancials[]
}

export function RevenueExpensesChart({ data }: RevenueExpensesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Revenue &amp; Expenses</CardTitle>
        <CardDescription>Last {data.length} months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={data} barGap={2} barCategoryGap="20%">
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
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
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
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
