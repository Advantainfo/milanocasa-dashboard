import { Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityRow } from "@/components/dashboard/activity-row"
import { formatCurrency, formatDate } from "@/lib/format"
import type { RecentPayment } from "@/server/repositories/dashboard.repo"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"

interface RecentPaymentsWidgetProps {
  payments: RecentPayment[]
  bare?: boolean
}

export async function RecentPaymentsWidget({
  payments,
  bare = false,
}: RecentPaymentsWidgetProps) {
  const { dictionary: dict } = await getServerDictionary()

  const list =
    payments.length === 0 ? (
      <p className="text-muted-foreground text-sm">{dict.dashboard.widgets.noPaymentsYet}</p>
    ) : (
      <div className="divide-y">
        {payments.map((payment) => (
          <ActivityRow
            key={payment.id}
            href={`/orders/${payment.orderId}`}
            icon={Wallet}
            title={payment.customerName}
            subtitle={`${payment.orderNumber} · ${dict.statuses.paymentMethod[payment.method]}`}
            trailing={
              <div className="text-right">
                <p className="font-medium">{formatCurrency(payment.amount)}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(payment.paymentDate)}
                </p>
              </div>
            }
          />
        ))}
      </div>
    )

  if (bare) return list

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{dict.dashboard.widgets.recentPayments}</CardTitle>
      </CardHeader>
      <CardContent>{list}</CardContent>
    </Card>
  )
}
