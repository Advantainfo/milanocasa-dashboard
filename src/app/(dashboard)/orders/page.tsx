import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { listAllCustomersForSelect } from "@/server/repositories/customers.repo"
import { listOrders, type OrderSortColumn } from "@/server/repositories/orders.repo"
import { ORDER_STATUSES, type OrderStatus } from "@/types/database"
import { OrdersTable } from "@/components/orders/orders-table"
import { OrdersToolbar } from "@/components/orders/orders-toolbar"

const SORT_COLUMNS: OrderSortColumn[] = [
  "orderNumber",
  "customerName",
  "salePrice",
  "remainingBalance",
  "deliveryDate",
  "status",
  "createdAt",
]

interface OrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search : ""
  const statusParam = typeof params.status === "string" ? params.status : ""
  const status = ORDER_STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined
  const page = Math.max(1, Number(params.page) || 1)
  const sortByParam = typeof params.sortBy === "string" ? params.sortBy : "createdAt"
  const sortBy = SORT_COLUMNS.includes(sortByParam as OrderSortColumn)
    ? (sortByParam as OrderSortColumn)
    : "createdAt"
  const sortDir = params.sortDir === "asc" ? "asc" : "desc"

  const [{ items, totalCount }, customers] = await Promise.all([
    listOrders({ search, status, page, pageSize: DEFAULT_PAGE_SIZE, sortBy, sortDir }),
    listAllCustomersForSelect(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Orders</h2>
        <p className="text-muted-foreground text-sm">
          Track every order from new to delivered and paid.
        </p>
      </div>
      <OrdersToolbar
        defaultSearch={search}
        defaultStatus={status ?? ""}
        customers={customers}
      />
      <OrdersTable
        items={items}
        customers={customers}
        totalCount={totalCount}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        sortBy={sortBy}
        sortDir={sortDir}
      />
    </div>
  )
}
