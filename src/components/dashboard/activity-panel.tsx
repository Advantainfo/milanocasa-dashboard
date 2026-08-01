import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardSection } from "@/components/dashboard/dashboard-section"
import { RecentOrdersWidget } from "@/components/dashboard/recent-orders-widget"
import { RecentPaymentsWidget } from "@/components/dashboard/recent-payments-widget"
import { RecentExpensesWidget } from "@/components/dashboard/recent-expenses-widget"
import { UpcomingDeliveriesWidget } from "@/components/dashboard/upcoming-deliveries-widget"
import { OutstandingBalancesWidget } from "@/components/dashboard/outstanding-balances-widget"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"
import type {
  OutstandingBalance,
  RecentExpense,
  RecentOrder,
  RecentPayment,
  UpcomingDelivery,
} from "@/server/repositories/dashboard.repo"

interface ActivityPanelProps {
  orders: RecentOrder[]
  payments: RecentPayment[]
  expenses: RecentExpense[]
  deliveries: UpcomingDelivery[]
  balances: OutstandingBalance[]
}

/** Single tabbed panel consolidating the recent-activity lists that used to be
 *  5 separate stacked cards - same underlying widgets, rendered in `bare` mode. */
export async function ActivityPanel({
  orders,
  payments,
  expenses,
  deliveries,
  balances,
}: ActivityPanelProps) {
  const { dictionary: dict } = await getServerDictionary()

  return (
    <DashboardSection
      title={dict.dashboard.widgets.activity}
      className="h-full"
      contentClassName="flex flex-col"
    >
      <Tabs defaultValue="orders" className="flex-1">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList variant="line" className="w-max min-w-full">
            <TabsTrigger value="orders">{dict.dashboard.widgets.recentOrders}</TabsTrigger>
            <TabsTrigger value="payments">{dict.dashboard.widgets.recentPayments}</TabsTrigger>
            <TabsTrigger value="expenses">{dict.dashboard.widgets.recentExpenses}</TabsTrigger>
            <TabsTrigger value="deliveries">
              {dict.dashboard.widgets.upcomingDeliveries}
            </TabsTrigger>
            <TabsTrigger value="balances">
              {dict.dashboard.widgets.outstandingBalances}
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="max-h-[380px] overflow-y-auto">
          <TabsContent value="orders">
            <RecentOrdersWidget orders={orders} bare />
          </TabsContent>
          <TabsContent value="payments">
            <RecentPaymentsWidget payments={payments} bare />
          </TabsContent>
          <TabsContent value="expenses">
            <RecentExpensesWidget expenses={expenses} bare />
          </TabsContent>
          <TabsContent value="deliveries">
            <UpcomingDeliveriesWidget deliveries={deliveries} bare />
          </TabsContent>
          <TabsContent value="balances">
            <OutstandingBalancesWidget balances={balances} bare />
          </TabsContent>
        </div>
      </Tabs>
    </DashboardSection>
  )
}
