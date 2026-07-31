import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/format"
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "@/lib/constants"
import type { UpcomingDelivery } from "@/server/repositories/dashboard.repo"

export function UpcomingDeliveriesWidget({
  deliveries,
}: {
  deliveries: UpcomingDelivery[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        {deliveries.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing scheduled.</p>
        ) : (
          <div className="divide-y">
            {deliveries.map((delivery) => (
              <Link
                key={delivery.id}
                href={`/orders/${delivery.id}`}
                className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{delivery.customerName}</p>
                  <p className="text-muted-foreground truncate">
                    {delivery.orderNumber} · {delivery.furnitureDescription}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-muted-foreground">
                    {formatDate(delivery.deliveryDate)}
                  </span>
                  <StatusBadge
                    label={ORDER_STATUS_LABELS[delivery.status]}
                    variant={ORDER_STATUS_BADGE_VARIANT[delivery.status]}
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
