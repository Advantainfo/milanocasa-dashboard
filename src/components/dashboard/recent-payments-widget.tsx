import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/format"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import type { RecentPayment } from "@/server/repositories/dashboard.repo"

export function RecentPaymentsWidget({ payments }: { payments: RecentPayment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No payments yet.</p>
        ) : (
          <div className="divide-y">
            {payments.map((payment) => (
              <Link
                key={payment.id}
                href={`/orders/${payment.orderId}`}
                className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{payment.customerName}</p>
                  <p className="text-muted-foreground truncate">
                    {payment.orderNumber} · {PAYMENT_METHOD_LABELS[payment.method]}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                  <p className="text-muted-foreground">
                    {formatDate(payment.paymentDate)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
