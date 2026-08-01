import dynamic from "next/dynamic"
import {
  ArrowLeftRight,
  BadgeEuro,
  Banknote,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { listAllCustomersForSelect } from "@/server/repositories/customers.repo"
import { listOrdersForSelect } from "@/server/repositories/orders.repo"
import {
  getDashboardKpis,
  getMonthlyFinancials,
  getOutstandingBalances,
  getRecentExpenses,
  getRecentOrders,
  getRecentPayments,
  getUpcomingDeliveries,
} from "@/server/repositories/dashboard.repo"
import { KpiCard, type KpiTrend } from "@/components/dashboard/kpi-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityPanel } from "@/components/dashboard/activity-panel"
import { DashboardSection } from "@/components/dashboard/dashboard-section"
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/dashboard/dashboard-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"

function chartSkeleton(height: number) {
  return <Skeleton className="w-full rounded-xl" style={{ height }} />
}

const RevenueExpensesChart = dynamic(
  () =>
    import("@/components/dashboard/revenue-expenses-chart").then(
      (m) => m.RevenueExpensesChart
    ),
  { loading: () => chartSkeleton(380) }
)
const CashFlowChart = dynamic(
  () => import("@/components/dashboard/cash-flow-chart").then((m) => m.CashFlowChart),
  { loading: () => chartSkeleton(380) }
)
const DivergingBarChart = dynamic(
  () =>
    import("@/components/dashboard/diverging-bar-chart").then((m) => m.DivergingBarChart),
  { loading: () => chartSkeleton(300) }
)
const DonutChart = dynamic(
  () => import("@/components/dashboard/charts/donut-chart").then((m) => m.DonutChart),
  { loading: () => chartSkeleton(180) }
)

function computeTrend(current: number, previous: number): KpiTrend | undefined {
  if (previous === 0 && current === 0) return undefined
  if (previous === 0) {
    return { direction: current > 0 ? "up" : "down", label: current > 0 ? "+100%" : "-100%" }
  }
  const change = ((current - previous) / Math.abs(previous)) * 100
  if (Math.abs(change) < 0.5) return { direction: "flat", label: "0%" }
  const rounded = Math.round(change)
  return {
    direction: rounded > 0 ? "up" : "down",
    label: `${rounded > 0 ? "+" : ""}${rounded}%`,
  }
}

export default async function DashboardPage() {
  const { dictionary: dict } = await getServerDictionary()
  const [
    kpis,
    monthly,
    recentOrders,
    recentPayments,
    recentExpenses,
    upcomingDeliveries,
    outstandingBalances,
    customers,
    orders,
  ] = await Promise.all([
    getDashboardKpis(),
    getMonthlyFinancials(6),
    getRecentOrders(5),
    getRecentPayments(5),
    getRecentExpenses(5),
    getUpcomingDeliveries(5),
    getOutstandingBalances(5),
    listAllCustomersForSelect(),
    listOrdersForSelect(),
  ])

  const lastMonth = monthly[monthly.length - 1]
  const priorMonth = monthly[monthly.length - 2]

  const profitTrend = priorMonth
    ? computeTrend(Number(lastMonth.profit), Number(priorMonth.profit))
    : undefined
  const expensesTrend = priorMonth
    ? computeTrend(Number(lastMonth.expenses), Number(priorMonth.expenses))
    : undefined
  const cashFlowTrend = priorMonth
    ? computeTrend(Number(lastMonth.cashFlow), Number(priorMonth.cashFlow))
    : undefined

  const totalRevenue = Number(kpis.totalRevenue)
  const outstanding = Number(kpis.outstandingPayments)
  const collected = Math.max(0, totalRevenue - outstanding)

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{dict.dashboard.title}</h2>
          <p className="text-muted-foreground text-sm">{dict.dashboard.subtitle}</p>
        </div>
      </FadeIn>

      <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard
            label={dict.dashboard.kpi.totalRevenue}
            value={totalRevenue}
            format="currency"
            hint={dict.dashboard.kpi.allTime}
            icon={<TrendingUp className="size-4" />}
            color="var(--kpi-revenue)"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label={dict.dashboard.kpi.netProfit}
            value={Number(kpis.netProfitThisMonth)}
            format="currency"
            hint={dict.dashboard.kpi.thisMonth}
            icon={<BadgeEuro className="size-4" />}
            color="var(--kpi-profit)"
            tone={Number(kpis.netProfitThisMonth) < 0 ? "amber" : "default"}
            trend={profitTrend}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label={dict.dashboard.kpi.outstandingPayments}
            value={outstanding}
            format="currency"
            icon={<Wallet className="size-4" />}
            color="var(--kpi-outstanding)"
            tone={outstanding > 0 ? "amber" : "default"}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label={dict.dashboard.kpi.orders}
            value={kpis.totalOrders}
            icon={<ShoppingCart className="size-4" />}
            color="var(--kpi-orders)"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label={dict.dashboard.kpi.customers}
            value={kpis.totalCustomers}
            icon={<Users className="size-4" />}
            color="var(--kpi-customers)"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label={dict.dashboard.kpi.expenses}
            value={Number(kpis.expensesThisMonth)}
            format="currency"
            hint={dict.dashboard.kpi.thisMonth}
            icon={<Banknote className="size-4" />}
            color="var(--kpi-expenses)"
            trend={expensesTrend}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label={dict.dashboard.kpi.pendingDeliveries}
            value={kpis.pendingDeliveries}
            icon={<Truck className="size-4" />}
            color="var(--kpi-pending-delivery)"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label={dict.dashboard.charts.cashFlowTitle}
            value={Number(lastMonth.cashFlow)}
            format="currency"
            hint={dict.dashboard.kpi.thisMonth}
            icon={<ArrowLeftRight className="size-4" />}
            color="var(--kpi-cash-flow)"
            tone={Number(lastMonth.cashFlow) < 0 ? "amber" : "default"}
            trend={cashFlowTrend}
          />
        </StaggerItem>
      </StaggerGroup>

      <FadeIn delay={0.1}>
        <QuickActions customers={customers} orders={orders} />
      </FadeIn>

      <div className="grid gap-4 lg:grid-cols-3">
        <FadeIn delay={0.05} className="lg:col-span-2">
          <RevenueExpensesChart data={monthly} />
        </FadeIn>
        <div className="grid gap-4">
          <FadeIn delay={0.1}>
            <DashboardSection
              title={dict.dashboard.charts.collectionsTitle}
              description={dict.dashboard.charts.collectionsDescription}
            >
              <DonutChart
                height={180}
                centerValue={formatCurrency(totalRevenue)}
                centerLabel={dict.dashboard.kpi.totalRevenue}
                format="currency"
                data={[
                  {
                    key: "collected",
                    label: dict.dashboard.widgets.collected,
                    value: collected,
                    color: "var(--chart-1)",
                  },
                  {
                    key: "outstanding",
                    label: dict.dashboard.widgets.outstanding,
                    value: outstanding,
                    color: "var(--warning)",
                  },
                ]}
              />
            </DashboardSection>
          </FadeIn>
          <FadeIn delay={0.15}>
            <DivergingBarChart
              title={dict.dashboard.charts.profitTitle}
              description={dict.dashboard.charts.profitDescription}
              valueLabel="profit"
              height={180}
              data={monthly.map((m) => ({ monthLabel: m.monthLabel, value: m.profit }))}
            />
          </FadeIn>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FadeIn delay={0.05} className="lg:col-span-2">
          <CashFlowChart data={monthly} />
        </FadeIn>
        <FadeIn delay={0.1}>
          <ActivityPanel
            orders={recentOrders}
            payments={recentPayments}
            expenses={recentExpenses}
            deliveries={upcomingDeliveries}
            balances={outstandingBalances}
          />
        </FadeIn>
      </div>
    </div>
  )
}
