import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getOrderById, getOrderPayments } from "@/server/repositories/orders.repo"
import { listAllCustomersForSelect } from "@/server/repositories/customers.repo"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  ORDER_STATUS_BADGE_VARIANT,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { OrderFormDialog } from "@/components/orders/order-form-dialog"

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
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
            <Link href="/orders" aria-label="Back to orders">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                {order.orderNumber}
              </h2>
              <StatusBadge
                label={ORDER_STATUS_LABELS[order.status]}
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
        <OrderFormDialog
          mode="edit"
          customers={customers}
          order={order}
          trigger={<Button variant="outline">Edit</Button>}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Sale Price
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(order.salePrice)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(order.paidAmount)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Remaining Balance
            </CardTitle>
          </CardHeader>
          <CardContent
            className={
              Number(order.remainingBalance) > 0
                ? "text-2xl font-semibold text-amber-600 dark:text-amber-500"
                : "text-2xl font-semibold"
            }
          >
            {formatCurrency(order.remainingBalance)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow label="Furniture" value={order.furnitureDescription} />
            <DetailRow label="Quantity" value={String(order.quantity)} />
            <DetailRow
              label="Delivery date"
              value={order.deliveryDate ? formatDate(order.deliveryDate) : null}
            />
            <DetailRow label="Notes" value={order.notes} />
            <DetailRow label="Created" value={formatDate(order.createdAt)} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
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
                        {PAYMENT_METHOD_LABELS[payment.method]}
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
