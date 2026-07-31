import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  EXPENSE_CATEGORY_LABELS,
  ORDER_STATUS_BADGE_VARIANT,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants"
import type { ReportData } from "@/server/repositories/reports.repo"

export function ReportPreview({ data }: { data: ReportData }) {
  const { summary, orders, expenses, payments } = data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Revenue" value={formatCurrency(summary.revenue)} />
        <SummaryCard label="Expenses" value={formatCurrency(summary.expenses)} />
        <SummaryCard
          label="Profit"
          value={formatCurrency(summary.profit)}
          tone={Number(summary.profit) < 0 ? "amber" : "default"}
        />
        <SummaryCard
          label="Payments Received"
          value={formatCurrency(summary.paymentsReceived)}
        />
        <SummaryCard label="Orders" value={String(summary.orderCount)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders in this period.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Furniture</TableHead>
                    <TableHead className="text-right">Sale Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderNumber}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {order.furnitureDescription}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.salePrice)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={ORDER_STATUS_LABELS[order.status]}
                          variant={ORDER_STATUS_BADGE_VARIANT[order.status]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses ({expenses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-muted-foreground text-sm">No expenses in this period.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                        <TableCell>{EXPENSE_CATEGORY_LABELS[expense.category]}</TableCell>
                        <TableCell>{expense.supplier || "—"}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payments ({payments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No payments in this period.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.orderNumber}</TableCell>
                        <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "amber"
}) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <p
          className={
            tone === "amber"
              ? "text-2xl font-semibold tracking-tight text-amber-600 dark:text-amber-500"
              : "text-2xl font-semibold tracking-tight"
          }
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
