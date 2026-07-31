"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Pencil } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, type SortState } from "@/components/shared/data-table"
import { Pagination } from "@/components/shared/pagination"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/format"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import type {
  PaymentListItem,
  PaymentSortColumn,
  SortDirection,
} from "@/server/repositories/payments.repo"
import type { OrderOption } from "@/server/repositories/orders.repo"
import { PaymentFormDialog } from "@/components/payments/payment-form-dialog"
import { DeletePaymentDialog } from "@/components/payments/delete-payment-dialog"

interface PaymentsTableProps {
  items: PaymentListItem[]
  orders: OrderOption[]
  totalCount: number
  page: number
  pageSize: number
  sortBy: PaymentSortColumn
  sortDir: SortDirection
}

export function PaymentsTable({
  items,
  orders,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortDir,
}: PaymentsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function pushParams(next: Record<string, string | number>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(next).forEach(([key, value]) => params.set(key, String(value)))
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSortChange(nextSortBy: string) {
    const nextSortDir = sortBy === nextSortBy && sortDir === "asc" ? "desc" : "asc"
    pushParams({ sortBy: nextSortBy, sortDir: nextSortDir, page: 1 })
  }

  function handlePageChange(nextPage: number) {
    pushParams({ page: nextPage })
  }

  const sort: SortState = { sortBy, sortDir }

  const columns: ColumnDef<PaymentListItem, unknown>[] = [
    {
      accessorKey: "paymentDate",
      header: "Date",
      meta: { sortKey: "paymentDate" },
      cell: ({ row }) => formatDate(row.original.paymentDate),
    },
    {
      accessorKey: "orderNumber",
      header: "Order",
      meta: { sortKey: "orderNumber" },
      cell: ({ row }) => (
        <Link
          href={`/orders/${row.original.orderId}`}
          className="font-medium whitespace-nowrap hover:underline"
        >
          {row.original.orderNumber}
        </Link>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <Link href={`/customers/${row.original.customerId}`} className="hover:underline">
          {row.original.customerName}
        </Link>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      meta: {
        sortKey: "amount",
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "method",
      header: "Method",
      meta: { sortKey: "method" },
      cell: ({ row }) => PAYMENT_METHOD_LABELS[row.original.method],
    },
    {
      id: "reference",
      header: "Reference",
      cell: ({ row }) =>
        row.original.reference || <span className="text-muted-foreground">—</span>,
    },
    {
      id: "actions",
      header: "",
      meta: { headerClassName: "w-0", cellClassName: "text-right" },
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <PaymentFormDialog
            mode="edit"
            orders={orders}
            payment={row.original}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Edit payment">
                <Pencil className="size-4" />
              </Button>
            }
          />
          <DeletePaymentDialog
            paymentId={row.original.id}
            orderId={row.original.orderId}
            orderNumber={row.original.orderNumber}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-2">
      <DataTable
        columns={columns}
        data={items}
        sort={sort}
        onSortChange={handleSortChange}
        emptyMessage="No payments recorded yet."
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
