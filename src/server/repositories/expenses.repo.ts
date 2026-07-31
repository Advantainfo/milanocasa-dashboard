import "server-only"

import { query, queryOne } from "@/lib/db"
import type { ExpenseCategory } from "@/types/database"

export type ExpenseSortColumn = "expenseDate" | "supplier" | "amount" | "category"
export type SortDirection = "asc" | "desc"

const SORT_COLUMN_SQL: Record<ExpenseSortColumn, string> = {
  expenseDate: "expense_date",
  supplier: "supplier",
  amount: "amount",
  category: "category",
}

export interface ExpenseListItem {
  id: string
  category: ExpenseCategory
  supplier: string | null
  amount: string
  invoiceNumber: string | null
  expenseDate: string
  notes: string | null
}

interface ExpenseRow {
  id: string
  category: ExpenseCategory
  supplier: string | null
  amount: string
  invoice_number: string | null
  expense_date: string
  notes: string | null
}

function toExpenseListItem(row: ExpenseRow): ExpenseListItem {
  return {
    id: row.id,
    category: row.category,
    supplier: row.supplier,
    amount: row.amount,
    invoiceNumber: row.invoice_number,
    expenseDate: row.expense_date,
    notes: row.notes,
  }
}

export interface ListExpensesParams {
  search?: string
  category?: ExpenseCategory
  page: number
  pageSize: number
  sortBy: ExpenseSortColumn
  sortDir: SortDirection
}

export async function listExpenses(
  params: ListExpensesParams
): Promise<{ items: ExpenseListItem[]; totalCount: number }> {
  const { search, category, page, pageSize, sortBy, sortDir } = params
  const searchTerm = search?.trim() || null
  const offset = (page - 1) * pageSize

  const conditions = ["deleted_at IS NULL"]
  const queryParams: unknown[] = []

  if (searchTerm) {
    queryParams.push(searchTerm)
    conditions.push(
      `(supplier ILIKE '%' || $${queryParams.length} || '%' OR
        invoice_number ILIKE '%' || $${queryParams.length} || '%' OR
        notes ILIKE '%' || $${queryParams.length} || '%')`
    )
  }

  if (category) {
    queryParams.push(category)
    conditions.push(`category = $${queryParams.length}`)
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`
  const orderColumn = SORT_COLUMN_SQL[sortBy]
  const orderDirection = sortDir === "asc" ? "ASC" : "DESC"

  const totalCountRow = await queryOne<{ count: number }>(
    `SELECT count(*)::int AS count FROM expenses ${whereClause}`,
    queryParams
  )

  const dataParams = [...queryParams, pageSize, offset]
  const limitPlaceholder = `$${dataParams.length - 1}`
  const offsetPlaceholder = `$${dataParams.length}`

  const rows = await query<ExpenseRow>(
    `SELECT id, category, supplier, amount, invoice_number, expense_date, notes
     FROM expenses
     ${whereClause}
     ORDER BY ${orderColumn} ${orderDirection}
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    dataParams
  )

  return {
    items: rows.map(toExpenseListItem),
    totalCount: totalCountRow?.count ?? 0,
  }
}

export interface ExpenseInput {
  category: ExpenseCategory
  supplier: string
  amount: number
  invoiceNumber: string
  expenseDate: string
  notes: string
}

export async function createExpense(input: ExpenseInput): Promise<{ id: string }> {
  const row = await queryOne<{ id: string }>(
    `INSERT INTO expenses (category, supplier, amount, invoice_number, expense_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      input.category,
      input.supplier || null,
      input.amount,
      input.invoiceNumber || null,
      input.expenseDate,
      input.notes || null,
    ]
  )

  if (!row) throw new Error("Failed to create expense.")
  return row
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<void> {
  await query(
    `UPDATE expenses
     SET category = $1, supplier = $2, amount = $3, invoice_number = $4, expense_date = $5, notes = $6
     WHERE id = $7 AND deleted_at IS NULL`,
    [
      input.category,
      input.supplier || null,
      input.amount,
      input.invoiceNumber || null,
      input.expenseDate,
      input.notes || null,
      id,
    ]
  )
}

export async function softDeleteExpense(id: string): Promise<void> {
  await query("UPDATE expenses SET deleted_at = now() WHERE id = $1", [id])
}
