"use client"

import { formatCurrency } from "@/lib/format"
import type { MonthlyFinancials } from "@/server/repositories/dashboard.repo"
import { useDictionary } from "@/lib/i18n/dictionary-provider"
import { DashboardSection } from "@/components/dashboard/dashboard-section"
import { AreaTrendChart } from "@/components/dashboard/charts/area-trend-chart"

interface CashFlowChartProps {
  data: MonthlyFinancials[]
}

/** Cash actually received vs. expenses actually paid, per month - a different lens
 *  than the invoiced revenue/expenses chart above it. */
export function CashFlowChart({ data }: CashFlowChartProps) {
  const dict = useDictionary()

  return (
    <DashboardSection
      title={dict.dashboard.charts.cashFlowTitle}
      description={dict.dashboard.charts.cashFlowDescription}
      className="h-full"
    >
      <AreaTrendChart
        data={data}
        categoryKey="monthLabel"
        height={300}
        valueFormatter={formatCurrency}
        series={[
          {
            key: "cashIn",
            label: dict.reports.summary.paymentsReceived,
            color: "var(--chart-1)",
          },
          {
            key: "expenses",
            label: dict.dashboard.charts.expenses,
            color: "var(--chart-2)",
          },
        ]}
      />
    </DashboardSection>
  )
}
