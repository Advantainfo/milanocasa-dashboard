"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Pencil } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, type SortState } from "@/components/shared/data-table"
import { Pagination } from "@/components/shared/pagination"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/format"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants"
import type {
  ExpenseListItem,
  ExpenseSortColumn,
  SortDirection,
} from "@/server/repositories/expenses.repo"
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog"
import { DeleteExpenseDialog } from "@/components/expenses/delete-expense-dialog"

interface ExpensesTableProps {
  items: ExpenseListItem[]
  totalCount: number
  page: number
  pageSize: number
  sortBy: ExpenseSortColumn
  sortDir: SortDirection
}

export function ExpensesTable({
  items,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortDir,
}: ExpensesTableProps) {
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

  const columns: ColumnDef<ExpenseListItem, unknown>[] = [
    {
      accessorKey: "expenseDate",
      header: "Date",
      meta: { sortKey: "expenseDate" },
      cell: ({ row }) => formatDate(row.original.expenseDate),
    },
    {
      accessorKey: "category",
      header: "Category",
      meta: { sortKey: "category" },
      cell: ({ row }) => EXPENSE_CATEGORY_LABELS[row.original.category],
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      meta: { sortKey: "supplier" },
      cell: ({ row }) =>
        row.original.supplier || <span className="text-muted-foreground">—</span>,
    },
    {
      id: "invoiceNumber",
      header: "Invoice",
      cell: ({ row }) =>
        row.original.invoiceNumber || <span className="text-muted-foreground">—</span>,
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
      id: "actions",
      header: "",
      meta: { headerClassName: "w-0", cellClassName: "text-right" },
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <ExpenseFormDialog
            mode="edit"
            expense={row.original}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Edit expense">
                <Pencil className="size-4" />
              </Button>
            }
          />
          <DeleteExpenseDialog expenseId={row.original.id} />
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
        emptyMessage="No expenses yet. Add your first expense to get started."
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
