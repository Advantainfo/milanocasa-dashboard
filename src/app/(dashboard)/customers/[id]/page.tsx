import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getCustomerById, getCustomerOrders } from "@/server/repositories/customers.repo"
import { formatCurrency, formatDate } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"
import { formatMessage } from "@/lib/i18n/format-message"

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { dictionary: dict } = await getServerDictionary()
  const { id } = await params
  const customer = await getCustomerById(id)

  if (!customer) {
    notFound()
  }

  const orders = await getCustomerOrders(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="/customers"
              aria-label={formatMessage(dict.common.backTo, { page: dict.customers.title })}
            >
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{customer.name}</h2>
            {customer.company && (
              <p className="text-muted-foreground text-sm">{customer.company}</p>
            )}
          </div>
        </div>
        <CustomerFormDialog
          mode="edit"
          customer={customer}
          trigger={<Button variant="outline">{dict.common.edit}</Button>}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {dict.customers.detail.totalOrders}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {customer.totalOrders}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {dict.customers.detail.totalRevenue}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(customer.totalRevenue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {dict.customers.detail.outstandingBalance}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(customer.outstandingBalance)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{dict.customers.detail.details}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow label={dict.customers.vatNumber} value={customer.vatNumber} />
            <DetailRow label={dict.customers.email} value={customer.email} />
            <DetailRow label={dict.customers.phone} value={customer.phone} />
            <DetailRow label={dict.customers.address} value={customer.address} />
            <DetailRow label={dict.common.notes} value={customer.notes} />
            <DetailRow
              label={dict.customers.detail.customerSince}
              value={formatDate(customer.createdAt)}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{dict.customers.detail.recentOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {dict.customers.detail.noOrdersYet}
              </p>
            ) : (
              <div className="divide-y">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-muted-foreground">
                        {order.furnitureDescription}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.salePrice)}</p>
                      <p className="text-muted-foreground">
                        {Number(order.remainingBalance) > 0
                          ? `${formatCurrency(order.remainingBalance)} ${dict.customers.detail.due}`
                          : dict.customers.detail.paid}
                      </p>
                    </div>
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
