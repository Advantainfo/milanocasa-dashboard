import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency } from "@/lib/format"
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "@/lib/constants"
import type { RecentOrder } from "@/server/repositories/dashboard.repo"

export function RecentOrdersWidget({ orders }: { orders: RecentOrder[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{order.orderNumber}</p>
                  <p className="text-muted-foreground truncate">{order.customerName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-medium">{formatCurrency(order.salePrice)}</span>
                  <StatusBadge
                    label={ORDER_STATUS_LABELS[order.status]}
                    variant={ORDER_STATUS_BADGE_VARIANT[order.status]}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
