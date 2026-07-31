import "server-only"

import { query, queryOne } from "@/lib/db"
import type { PaymentMethod } from "@/types/database"

export type PaymentSortColumn = "paymentDate" | "amount" | "method" | "orderNumber"
export type SortDirection = "asc" | "desc"

const SORT_COLUMN_SQL: Record<PaymentSortColumn, string> = {
  paymentDate: "p.payment_date",
  amount: "p.amount",
  method: "p.method",
  orderNumber: "o.order_number",
}

export interface PaymentListItem {
  id: string
  orderId: string
  orderNumber: string
  customerId: string
  customerName: string
  amount: string
  paymentDate: string
  method: PaymentMethod
  reference: string | null
  notes: string | null
}

interface PaymentListRow {
  id: string
  order_id: string
  order_number: string
  customer_id: string
  customer_name: string
  amount: string
  payment_date: string
  method: PaymentMethod
  reference: string | null
  notes: string | null
}

function toPaymentListItem(row: PaymentListRow): PaymentListItem {
  return {
    id: row.id,
    orderId: row.order_id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    amount: row.amount,
    paymentDate: row.payment_date,
    method: row.method,
    reference: row.reference,
    notes: row.notes,
  }
}

export interface ListPaymentsParams {
  search?: string
  method?: PaymentMethod
  page: number
  pageSize: number
  sortBy: PaymentSortColumn
  sortDir: SortDirection
}

export async function listPayments(
  params: ListPaymentsParams
): Promise<{ items: PaymentListItem[]; totalCount: number }> {
  const { search, method, page, pageSize, sortBy, sortDir } = params
  const searchTerm = search?.trim() || null
  const offset = (page - 1) * pageSize

  const conditions = ["p.deleted_at IS NULL"]
  const queryParams: unknown[] = []

  if (searchTerm) {
    queryParams.push(searchTerm)
    conditions.push(
      `(o.order_number ILIKE '%' || $${queryParams.length} || '%' OR
        c.name ILIKE '%' || $${queryParams.length} || '%' OR
        p.reference ILIKE '%' || $${queryParams.length} || '%')`
    )
  }

  if (method) {
    queryParams.push(method)
    conditions.push(`p.method = $${queryParams.length}`)
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`
  const orderColumn = SORT_COLUMN_SQL[sortBy]
  const orderDirection = sortDir === "asc" ? "ASC" : "DESC"

  const totalCountRow = await queryOne<{ count: number }>(
    `SELECT count(*)::int AS count
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     JOIN customers c ON c.id = o.customer_id
     ${whereClause}`,
    queryParams
  )

  const dataParams = [...queryParams, pageSize, offset]
  const limitPlaceholder = `$${dataParams.length - 1}`
  const offsetPlaceholder = `$${dataParams.length}`

  const rows = await query<PaymentListRow>(
    `SELECT
       p.id, p.order_id, o.order_number, c.id AS customer_id, c.name AS customer_name,
       p.amount, p.payment_date, p.method, p.reference, p.notes
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     JOIN customers c ON c.id = o.customer_id
     ${whereClause}
     ORDER BY ${orderColumn} ${orderDirection}
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    dataParams
  )

  return {
    items: rows.map(toPaymentListItem),
    totalCount: totalCountRow?.count ?? 0,
  }
}

export interface PaymentInput {
  orderId: string
  amount: number
  paymentDate: string
  method: PaymentMethod
  reference: string
  notes: string
}

export async function createPayment(input: PaymentInput): Promise<{ id: string }> {
  const row = await queryOne<{ id: string }>(
    `INSERT INTO payments (order_id, amount, payment_date, method, reference, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      input.orderId,
      input.amount,
      input.paymentDate,
      input.method,
      input.reference || null,
      input.notes || null,
    ]
  )

  if (!row) throw new Error("Failed to record payment.")
  return row
}

export async function updatePayment(id: string, input: PaymentInput): Promise<void> {
  await query(
    `UPDATE payments
     SET order_id = $1, amount = $2, payment_date = $3, method = $4, reference = $5, notes = $6
     WHERE id = $7 AND deleted_at IS NULL`,
    [
      input.orderId,
      input.amount,
      input.paymentDate,
      input.method,
      input.reference || null,
      input.notes || null,
      id,
    ]
  )
}

export async function softDeletePayment(id: string): Promise<void> {
  await query("UPDATE payments SET deleted_at = now() WHERE id = $1", [id])
}
