import {
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
import { KpiCard } from "@/components/dashboard/kpi-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RevenueExpensesChart } from "@/components/dashboard/revenue-expenses-chart"
import { DivergingBarChart } from "@/components/dashboard/diverging-bar-chart"
import { RecentOrdersWidget } from "@/components/dashboard/recent-orders-widget"
import { RecentPaymentsWidget } from "@/components/dashboard/recent-payments-widget"
import { RecentExpensesWidget } from "@/components/dashboard/recent-expenses-widget"
import { UpcomingDeliveriesWidget } from "@/components/dashboard/upcoming-deliveries-widget"
import { OutstandingBalancesWidget } from "@/components/dashboard/outstanding-balances-widget"

export default async function DashboardPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm">Your business at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(kpis.totalRevenue)}
          hint="All time"
          icon={TrendingUp}
        />
        <KpiCard
          label="Revenue This Month"
          value={formatCurrency(kpis.revenueThisMonth)}
          icon={BadgeEuro}
        />
        <KpiCard
          label="Outstanding Payments"
          value={formatCurrency(kpis.outstandingPayments)}
          icon={Wallet}
          tone={Number(kpis.outstandingPayments) > 0 ? "amber" : "default"}
        />
        <KpiCard
          label="Expenses"
          value={formatCurrency(kpis.expensesThisMonth)}
          hint="This month"
          icon={Banknote}
        />
        <KpiCard
          label="Net Profit"
          value={formatCurrency(kpis.netProfitThisMonth)}
          hint="This month"
          icon={TrendingUp}
          tone={Number(kpis.netProfitThisMonth) < 0 ? "amber" : "default"}
        />
        <KpiCard label="Orders" value={String(kpis.totalOrders)} icon={ShoppingCart} />
        <KpiCard label="Customers" value={String(kpis.totalCustomers)} icon={Users} />
        <KpiCard
          label="Pending Deliveries"
          value={String(kpis.pendingDeliveries)}
          icon={Truck}
        />
      </div>

      <QuickActions customers={customers} orders={orders} />

      <div className="space-y-4">
        <RevenueExpensesChart data={monthly} />
        <div className="grid gap-4 lg:grid-cols-2">
          <DivergingBarChart
            title="Profit"
            description="Revenue minus expenses, per month"
            valueLabel="profit"
            data={monthly.map((m) => ({ monthLabel: m.monthLabel, value: m.profit }))}
          />
          <DivergingBarChart
            title="Cash Flow"
            description="Payments received minus expenses paid, per month"
            valueLabel="cashFlow"
            data={monthly.map((m) => ({ monthLabel: m.monthLabel, value: m.cashFlow }))}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentOrdersWidget orders={recentOrders} />
        <UpcomingDeliveriesWidget deliveries={upcomingDeliveries} />
        <RecentPaymentsWidget payments={recentPayments} />
        <OutstandingBalancesWidget balances={outstandingBalances} />
        <RecentExpensesWidget expenses={recentExpenses} />
      </div>
    </div>
  )
}
