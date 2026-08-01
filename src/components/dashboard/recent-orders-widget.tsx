import { ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { ActivityRow } from "@/components/dashboard/activity-row"
import { formatCurrency } from "@/lib/format"
import { ORDER_STATUS_BADGE_VARIANT } from "@/lib/constants"
import type { RecentOrder } from "@/server/repositories/dashboard.repo"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"

interface RecentOrdersWidgetProps {
  orders: RecentOrder[]
  bare?: boolean
}

export async function RecentOrdersWidget({ orders, bare = false }: RecentOrdersWidgetProps) {
  const { dictionary: dict } = await getServerDictionary()

  const list =
    orders.length === 0 ? (
      <p className="text-muted-foreground text-sm">{dict.dashboard.widgets.noOrdersYet}</p>
    ) : (
      <div className="divide-y">
        {orders.map((order) => (
          <ActivityRow
            key={order.id}
            href={`/orders/${order.id}`}
            icon={ShoppingCart}
            title={order.orderNumber}
            subtitle={order.customerName}
            trailing={
              <>
                <span className="font-medium">{formatCurrency(order.salePrice)}</span>
                <StatusBadge
                  label={dict.statuses.order[order.status]}
                  variant={ORDER_STATUS_BADGE_VARIANT[order.status]}
                />
              </>
            }
          />
        ))}
      </div>
    )

  if (bare) return list

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{dict.dashboard.widgets.recentOrders}</CardTitle>
      </CardHeader>
      <CardContent>{list}</CardContent>
    </Card>
  )
}
