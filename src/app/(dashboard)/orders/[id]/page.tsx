import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"
import { getOrderById, getOrderPayments } from "@/server/repositories/orders.repo"
import { listAllCustomersForSelect } from "@/server/repositories/customers.repo"
import { formatCurrency, formatDate } from "@/lib/format"
import { ORDER_JOB_TYPE_BADGE_VARIANT, ORDER_STATUS_BADGE_VARIANT } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { OrderFormDialog } from "@/components/orders/order-form-dialog"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"
import { formatMessage } from "@/lib/i18n/format-message"

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { dictionary: dict } = await getServerDictionary()
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  const [payments, customers] = await Promise.all([
    getOrderPayments(id),
    listAllCustomersForSelect(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="/orders"
              aria-label={formatMessage(dict.common.backTo, { page: dict.orders.title })}
            >
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                {order.orderNumber}
              </h2>
              <StatusBadge
                label={dict.statuses.order[order.status]}
                variant={ORDER_STATUS_BADGE_VARIANT[order.status]}
              />
            </div>
            <Link
              href={`/customers/${order.customerId}`}
              className="text-muted-foreground text-sm hover:underline"
            >
              {order.customerName}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/orders/${order.id}/pdf`} download>
              <FileText className="size-4" />
              {dict.orders.generateCustomerPdf}
            </a>
          </Button>
          <OrderFormDialog
            mode="edit"
            customers={customers}
            order={order}
            trigger={<Button variant="outline">{dict.common.edit}</Button>}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {dict.orders.detail.salePrice}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(order.salePrice)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {dict.orders.detail.paid}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(order.paidAmount)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {dict.orders.detail.remainingBalance}
            </CardTitle>
          </CardHeader>
          <CardContent
            className={
              Number(order.remainingBalance) > 0
                ? "text-2xl font-semibold text-warning"
                : "text-2xl font-semibold"
            }
          >
            {formatCurrency(order.remainingBalance)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {dict.orders.detail.expectedProfit}
            </CardTitle>
          </CardHeader>
          <CardContent
            className={
              Number(order.expectedProfit) < 0
                ? "text-2xl font-semibold text-warning"
                : "text-2xl font-semibold"
            }
          >
            {formatCurrency(order.expectedProfit)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{dict.orders.detail.details}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow label={dict.orders.detail.furniture} value={order.furnitureDescription} />
            <DetailRow label={dict.orders.detail.quantity} value={String(order.quantity)} />
            <DetailRow
              label={dict.orders.detail.deliveryDate}
              value={order.deliveryDate ? formatDate(order.deliveryDate) : null}
            />
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{dict.orders.jobType}</span>
              <StatusBadge
                label={dict.orders.jobTypeOptions[order.jobType]}
                variant={ORDER_JOB_TYPE_BADGE_VARIANT[order.jobType]}
              />
            </div>
            <DetailRow label={dict.orders.materialCost} value={formatCurrency(order.materialCost)} />
            <DetailRow label={dict.orders.labourCost} value={formatCurrency(order.labourCost)} />
            <DetailRow label={dict.common.notes} value={order.notes} />
            <DetailRow label={dict.orders.detail.created} value={formatDate(order.createdAt)} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{dict.orders.detail.payments}</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {dict.orders.detail.noPaymentsYet}
              </p>
            ) : (
              <div className="divide-y">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-muted-foreground">
                        {dict.statuses.paymentMethod[payment.method]}
                        {payment.reference ? ` · ${payment.reference}` : ""}
                      </p>
                    </div>
                    <p className="text-muted-foreground">
                      {formatDate(payment.paymentDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value || "—"}</span>
    </div>
  )
}
