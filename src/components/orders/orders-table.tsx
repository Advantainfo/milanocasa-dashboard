"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Pencil } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, type SortState } from "@/components/shared/data-table"
import { Pagination } from "@/components/shared/pagination"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/format"
import type {
  OrderListItem,
  OrderSortColumn,
  SortDirection,
} from "@/server/repositories/orders.repo"
import type { CustomerOption } from "@/server/repositories/customers.repo"
import { OrderFormDialog } from "@/components/orders/order-form-dialog"
import { OrderStatusSelect } from "@/components/orders/order-status-select"
import { DeleteOrderDialog } from "@/components/orders/delete-order-dialog"

interface OrdersTableProps {
  items: OrderListItem[]
  customers: CustomerOption[]
  totalCount: number
  page: number
  pageSize: number
  sortBy: OrderSortColumn
  sortDir: SortDirection
}

export function OrdersTable({
  items,
  customers,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortDir,
}: OrdersTableProps) {
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

  const columns: ColumnDef<OrderListItem, unknown>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order",
      meta: { sortKey: "orderNumber" },
      cell: ({ row }) => (
        <Link
          href={`/orders/${row.original.id}`}
          className="font-medium whitespace-nowrap hover:underline"
        >
          {row.original.orderNumber}
        </Link>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      meta: { sortKey: "customerName" },
      cell: ({ row }) => (
        <Link href={`/customers/${row.original.customerId}`} className="hover:underline">
          {row.original.customerName}
        </Link>
      ),
    },
    {
      id: "furniture",
      header: "Furniture",
      cell: ({ row }) => (
        <div className="max-w-[220px] truncate" title={row.original.furnitureDescription}>
          {row.original.furnitureDescription}
          {row.original.quantity > 1 && (
            <span className="text-muted-foreground"> ×{row.original.quantity}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "salePrice",
      header: "Sale Price",
      meta: {
        sortKey: "salePrice",
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      cell: ({ row }) => formatCurrency(row.original.salePrice),
    },
    {
      accessorKey: "remainingBalance",
      header: "Balance",
      meta: {
        sortKey: "remainingBalance",
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      cell: ({ row }) => {
        const value = Number(row.original.remainingBalance)
        return (
          <span className={value > 0 ? "text-amber-600 dark:text-amber-500" : undefined}>
            {formatCurrency(value)}
          </span>
        )
      },
    },
    {
      accessorKey: "deliveryDate",
      header: "Delivery",
      meta: { sortKey: "deliveryDate" },
      cell: ({ row }) =>
        row.original.deliveryDate ? (
          formatDate(row.original.deliveryDate)
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: { sortKey: "status" },
      cell: ({ row }) => (
        <OrderStatusSelect orderId={row.original.id} status={row.original.status} />
      ),
    },
    {
      id: "actions",
      header: "",
      meta: { headerClassName: "w-0", cellClassName: "text-right" },
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <OrderFormDialog
            mode="edit"
            customers={customers}
            order={row.original}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit order ${row.original.orderNumber}`}
              >
                <Pencil className="size-4" />
              </Button>
            }
          />
          <DeleteOrderDialog
            orderId={row.original.id}
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
        emptyMessage="No orders yet. Create your first order to get started."
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
