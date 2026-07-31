import type { Metadata } from "next"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { listExpenses, type ExpenseSortColumn } from "@/server/repositories/expenses.repo"
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/database"
import { ExpensesTable } from "@/components/expenses/expenses-table"
import { ExpensesToolbar } from "@/components/expenses/expenses-toolbar"

export const metadata: Metadata = { title: "Expenses | Milano Casa" }

const SORT_COLUMNS: ExpenseSortColumn[] = [
  "expenseDate",
  "supplier",
  "amount",
  "category",
]

interface ExpensesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search : ""
  const categoryParam = typeof params.category === "string" ? params.category : ""
  const category = EXPENSE_CATEGORIES.includes(categoryParam as ExpenseCategory)
    ? (categoryParam as ExpenseCategory)
    : undefined
  const page = Math.max(1, Number(params.page) || 1)
  const sortByParam = typeof params.sortBy === "string" ? params.sortBy : "expenseDate"
  const sortBy = SORT_COLUMNS.includes(sortByParam as ExpenseSortColumn)
    ? (sortByParam as ExpenseSortColumn)
    : "expenseDate"
  const sortDir = params.sortDir === "asc" ? "asc" : "desc"

  const { items, totalCount } = await listExpenses({
    search,
    category,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy,
    sortDir,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Expenses</h2>
        <p className="text-muted-foreground text-sm">
          Track materials, transport, rent, and every other business cost.
        </p>
      </div>
      <ExpensesToolbar defaultSearch={search} defaultCategory={category ?? ""} />
      <ExpensesTable
        items={items}
        totalCount={totalCount}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        sortBy={sortBy}
        sortDir={sortDir}
      />
    </div>
  )
}
