import { CircleAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityRow } from "@/components/dashboard/activity-row"
import { formatCurrency } from "@/lib/format"
import type { OutstandingBalance } from "@/server/repositories/dashboard.repo"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"

interface OutstandingBalancesWidgetProps {
  balances: OutstandingBalance[]
  bare?: boolean
}

export async function OutstandingBalancesWidget({
  balances,
  bare = false,
}: OutstandingBalancesWidgetProps) {
  const { dictionary: dict } = await getServerDictionary()

  const list =
    balances.length === 0 ? (
      <p className="text-muted-foreground text-sm">{dict.dashboard.widgets.everyonePaidUp}</p>
    ) : (
      <div className="divide-y">
        {balances.map((balance) => (
          <ActivityRow
            key={balance.orderId}
            href={`/orders/${balance.orderId}`}
            icon={CircleAlert}
            iconClassName="bg-warning/10 text-warning ring-warning/25"
            title={balance.customerName}
            subtitle={balance.orderNumber}
            trailing={
              <span className="text-warning font-medium">
                {formatCurrency(balance.remainingBalance)}
              </span>
            }
          />
        ))}
      </div>
    )

  if (bare) return list

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{dict.dashboard.widgets.outstandingBalances}</CardTitle>
      </CardHeader>
      <CardContent>{list}</CardContent>
    </Card>
  )
}
