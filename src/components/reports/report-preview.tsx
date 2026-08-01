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
import { ORDER_STATUS_BADGE_VARIANT } from "@/lib/constants"
import type { ReportData } from "@/server/repositories/reports.repo"
import { useDictionary } from "@/lib/i18n/dictionary-provider"

export function ReportPreview({ data }: { data: ReportData }) {
  const { summary, orders, expenses, payments } = data
  const dict = useDictionary()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          label={dict.reports.summary.revenue}
          value={formatCurrency(summary.revenue)}
        />
        <SummaryCard
          label={dict.reports.summary.expenses}
          value={formatCurrency(summary.expenses)}
        />
        <SummaryCard
          label={dict.reports.summary.profit}
          value={formatCurrency(summary.profit)}
          tone={Number(summary.profit) < 0 ? "amber" : "default"}
        />
        <SummaryCard
          label={dict.reports.summary.paymentsReceived}
          value={formatCurrency(summary.paymentsReceived)}
        />
        <SummaryCard label={dict.reports.summary.orders} value={String(summary.orderCount)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {dict.reports.ordersSection} ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {dict.reports.noOrdersInPeriod}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dict.orders.columns.order}</TableHead>
                    <TableHead>{dict.orders.columns.customer}</TableHead>
                    <TableHead>{dict.orders.columns.furniture}</TableHead>
                    <TableHead className="text-right">
                      {dict.orders.columns.salePrice}
                    </TableHead>
                    <TableHead>{dict.orders.columns.status}</TableHead>
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
                          label={dict.statuses.order[order.status]}
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
            <CardTitle className="text-base">
              {dict.reports.expensesSection} ({expenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {dict.reports.noExpensesInPeriod}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dict.expenses.columns.date}</TableHead>
                      <TableHead>{dict.expenses.columns.category}</TableHead>
                      <TableHead>{dict.expenses.columns.supplier}</TableHead>
                      <TableHead className="text-right">
                        {dict.expenses.columns.amount}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                        <TableCell>
                          {dict.statuses.expenseCategory[expense.category]}
                        </TableCell>
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
            <CardTitle className="text-base">
              {dict.reports.paymentsSection} ({payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {dict.reports.noPaymentsInPeriod}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dict.payments.columns.date}</TableHead>
                      <TableHead>{dict.payments.columns.order}</TableHead>
                      <TableHead>{dict.payments.columns.method}</TableHead>
                      <TableHead className="text-right">
                        {dict.payments.columns.amount}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.orderNumber}</TableCell>
                        <TableCell>{dict.statuses.paymentMethod[payment.method]}</TableCell>
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
