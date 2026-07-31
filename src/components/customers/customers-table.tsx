"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Eye, Pencil } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, type SortState } from "@/components/shared/data-table"
import { Pagination } from "@/components/shared/pagination"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import type {
  CustomerListItem,
  CustomerSortColumn,
  SortDirection,
} from "@/server/repositories/customers.repo"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"
import { DeleteCustomerDialog } from "@/components/customers/delete-customer-dialog"

interface CustomersTableProps {
  items: CustomerListItem[]
  totalCount: number
  page: number
  pageSize: number
  sortBy: CustomerSortColumn
  sortDir: SortDirection
}

export function CustomersTable({
  items,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortDir,
}: CustomersTableProps) {
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

  const columns: ColumnDef<CustomerListItem, unknown>[] = [
    {
      accessorKey: "name",
      header: "Name",
      meta: { sortKey: "name" },
      cell: ({ row }) => (
        <div>
          <Link
            href={`/customers/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          {row.original.company && (
            <p className="text-muted-foreground text-sm">{row.original.company}</p>
          )}
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.email && <p>{row.original.email}</p>}
          {row.original.phone && (
            <p className="text-muted-foreground">{row.original.phone}</p>
          )}
          {!row.original.email && !row.original.phone && (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      meta: {
        sortKey: "totalOrders",
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      cell: ({ row }) => row.original.totalOrders,
    },
    {
      accessorKey: "totalRevenue",
      header: "Revenue",
      meta: {
        sortKey: "totalRevenue",
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      cell: ({ row }) => formatCurrency(row.original.totalRevenue),
    },
    {
      accessorKey: "outstandingBalance",
      header: "Outstanding",
      meta: {
        sortKey: "outstandingBalance",
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      cell: ({ row }) => {
        const value = Number(row.original.outstandingBalance)
        return (
          <span className={value > 0 ? "text-amber-600 dark:text-amber-500" : undefined}>
            {formatCurrency(value)}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "",
      meta: { headerClassName: "w-0", cellClassName: "text-right" },
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/customers/${row.original.id}`}
              aria-label={`View ${row.original.name}`}
            >
              <Eye className="size-4" />
            </Link>
          </Button>
          <CustomerFormDialog
            mode="edit"
            customer={row.original}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${row.original.name}`}
              >
                <Pencil className="size-4" />
              </Button>
            }
          />
          <DeleteCustomerDialog
            customerId={row.original.id}
            customerName={row.original.name}
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
        emptyMessage="No customers yet. Add your first customer to get started."
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
