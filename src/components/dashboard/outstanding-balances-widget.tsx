import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { OutstandingBalance } from "@/server/repositories/dashboard.repo"

export function OutstandingBalancesWidget({
  balances,
}: {
  balances: OutstandingBalance[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Outstanding Balances</CardTitle>
      </CardHeader>
      <CardContent>
        {balances.length === 0 ? (
          <p className="text-muted-foreground text-sm">Everyone is paid up.</p>
        ) : (
          <div className="divide-y">
            {balances.map((balance) => (
              <Link
                key={balance.orderId}
                href={`/orders/${balance.orderId}`}
                className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{balance.customerName}</p>
                  <p className="text-muted-foreground truncate">{balance.orderNumber}</p>
                </div>
                <span className="shrink-0 font-medium text-amber-600 dark:text-amber-500">
                  {formatCurrency(balance.remainingBalance)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
