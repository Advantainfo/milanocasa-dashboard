import { Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { ActivityRow } from "@/components/dashboard/activity-row"
import { formatDate } from "@/lib/format"
import { ORDER_STATUS_BADGE_VARIANT } from "@/lib/constants"
import type { UpcomingDelivery } from "@/server/repositories/dashboard.repo"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"

interface UpcomingDeliveriesWidgetProps {
  deliveries: UpcomingDelivery[]
  bare?: boolean
}

export async function UpcomingDeliveriesWidget({
  deliveries,
  bare = false,
}: UpcomingDeliveriesWidgetProps) {
  const { dictionary: dict } = await getServerDictionary()

  const list =
    deliveries.length === 0 ? (
      <p className="text-muted-foreground text-sm">{dict.dashboard.widgets.nothingScheduled}</p>
    ) : (
      <div className="divide-y">
        {deliveries.map((delivery) => (
          <ActivityRow
            key={delivery.id}
            href={`/orders/${delivery.id}`}
            icon={Truck}
            title={delivery.customerName}
            subtitle={`${delivery.orderNumber} · ${delivery.furnitureDescription}`}
            trailing={
              <>
                <span className="text-muted-foreground text-xs">
                  {formatDate(delivery.deliveryDate)}
                </span>
                <StatusBadge
                  label={dict.statuses.order[delivery.status]}
                  variant={ORDER_STATUS_BADGE_VARIANT[delivery.status]}
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
        <CardTitle className="text-base">{dict.dashboard.widgets.upcomingDeliveries}</CardTitle>
      </CardHeader>
      <CardContent>{list}</CardContent>
    </Card>
  )
}
