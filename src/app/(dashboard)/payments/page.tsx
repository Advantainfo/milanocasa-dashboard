import type { Metadata } from "next"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { listOrdersForSelect } from "@/server/repositories/orders.repo"
import { listPayments, type PaymentSortColumn } from "@/server/repositories/payments.repo"
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/database"
import { PaymentsTable } from "@/components/payments/payments-table"
import { PaymentsToolbar } from "@/components/payments/payments-toolbar"

export const metadata: Metadata = { title: "Payments | Milano Casa" }

const SORT_COLUMNS: PaymentSortColumn[] = [
  "paymentDate",
  "amount",
  "method",
  "orderNumber",
]

interface PaymentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search : ""
  const methodParam = typeof params.method === "string" ? params.method : ""
  const method = PAYMENT_METHODS.includes(methodParam as PaymentMethod)
    ? (methodParam as PaymentMethod)
    : undefined
  const page = Math.max(1, Number(params.page) || 1)
  const sortByParam = typeof params.sortBy === "string" ? params.sortBy : "paymentDate"
  const sortBy = SORT_COLUMNS.includes(sortByParam as PaymentSortColumn)
    ? (sortByParam as PaymentSortColumn)
    : "paymentDate"
  const sortDir = params.sortDir === "asc" ? "asc" : "desc"

  const [{ items, totalCount }, orders] = await Promise.all([
    listPayments({ search, method, page, pageSize: DEFAULT_PAGE_SIZE, sortBy, sortDir }),
    listOrdersForSelect(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Payments</h2>
        <p className="text-muted-foreground text-sm">
          Every payment received, with remaining balances updated automatically.
        </p>
      </div>
      <PaymentsToolbar
        defaultSearch={search}
        defaultMethod={method ?? ""}
        orders={orders}
      />
      <PaymentsTable
        items={items}
        orders={orders}
        totalCount={totalCount}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        sortBy={sortBy}
        sortDir={sortDir}
      />
    </div>
  )
}
