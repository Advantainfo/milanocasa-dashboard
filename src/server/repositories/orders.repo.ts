import "server-only"

import { randomUUID } from "node:crypto"
import { query, queryOne, withTransaction } from "@/lib/db"
import type { OrderStatus, PaymentMethod } from "@/types/database"

export type OrderSortColumn =
  | "orderNumber"
  | "customerName"
  | "salePrice"
  | "remainingBalance"
  | "deliveryDate"
  | "status"
  | "createdAt"

export type SortDirection = "asc" | "desc"

const SORT_COLUMN_SQL: Record<OrderSortColumn, string> = {
  orderNumber: "o.order_number",
  customerName: "c.name",
  salePrice: "o.sale_price",
  remainingBalance: "remaining_balance",
  deliveryDate: "o.delivery_date",
  status: "o.status",
  createdAt: "o.created_at",
}

export interface OrderListItem {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  furnitureDescription: string
  quantity: number
  salePrice: string
  remainingBalance: string
  deliveryDate: string | null
  status: OrderStatus
  notes: string | null
}

interface OrderListRow {
  id: string
  order_number: string
  customer_id: string
  customer_name: string
  furniture_description: string
  quantity: number
  sale_price: string
  remaining_balance: string
  delivery_date: string | null
  status: OrderStatus
  notes: string | null
}

function toOrderListItem(row: OrderListRow): OrderListItem {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    furnitureDescription: row.furniture_description,
    quantity: row.quantity,
    salePrice: row.sale_price,
    remainingBalance: row.remaining_balance,
    deliveryDate: row.delivery_date,
    status: row.status,
    notes: row.notes,
  }
}

export interface ListOrdersParams {
  search?: string
  status?: OrderStatus
  page: number
  pageSize: number
  sortBy: OrderSortColumn
  sortDir: SortDirection
}

export async function listOrders(
  params: ListOrdersParams
): Promise<{ items: OrderListItem[]; totalCount: number }> {
  const { search, status, page, pageSize, sortBy, sortDir } = params
  const searchTerm = search?.trim() || null
  const offset = (page - 1) * pageSize

  const conditions = ["o.deleted_at IS NULL"]
  const params_: unknown[] = []

  if (searchTerm) {
    params_.push(searchTerm)
    conditions.push(
      `(o.order_number ILIKE '%' || $${params_.length} || '%' OR
        o.furniture_description ILIKE '%' || $${params_.length} || '%' OR
        c.name ILIKE '%' || $${params_.length} || '%')`
    )
  }

  if (status) {
    params_.push(status)
    conditions.push(`o.status = $${params_.length}`)
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`
  const orderColumn = SORT_COLUMN_SQL[sortBy]
  const orderDirection = sortDir === "asc" ? "ASC" : "DESC"

  const totalCountRow = await queryOne<{ count: number }>(
    `SELECT count(*)::int AS count
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     ${whereClause}`,
    params_
  )

  const dataParams = [...params_, pageSize, offset]
  const limitPlaceholder = `$${dataParams.length - 1}`
  const offsetPlaceholder = `$${dataParams.length}`

  const rows = await query<OrderListRow>(
    `SELECT
       o.id, o.order_number, o.customer_id, c.name AS customer_name,
       o.furniture_description, o.quantity, o.sale_price,
       COALESCE(ob.remaining_balance, o.sale_price) AS remaining_balance,
       o.delivery_date, o.status, o.notes
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     LEFT JOIN order_balances ob ON ob.order_id = o.id
     ${whereClause}
     ORDER BY ${orderColumn} ${orderDirection}
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    dataParams
  )

  return {
    items: rows.map(toOrderListItem),
    totalCount: totalCountRow?.count ?? 0,
  }
}

export interface OrderDetail {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  furnitureDescription: string
  quantity: number
  salePrice: string
  paidAmount: string
  remainingBalance: string
  deliveryDate: string | null
  status: OrderStatus
  notes: string | null
  createdAt: string
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const row = await queryOne<{
    id: string
    order_number: string
    customer_id: string
    customer_name: string
    furniture_description: string
    quantity: number
    sale_price: string
    paid_amount: string
    remaining_balance: string
    delivery_date: string | null
    status: OrderStatus
    notes: string | null
    created_at: string
  }>(
    `SELECT
       o.id, o.order_number, o.customer_id, c.name AS customer_name,
       o.furniture_description, o.quantity, o.sale_price,
       COALESCE(ob.paid_amount, 0) AS paid_amount,
       COALESCE(ob.remaining_balance, o.sale_price) AS remaining_balance,
       o.delivery_date, o.status, o.notes, o.created_at
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     LEFT JOIN order_balances ob ON ob.order_id = o.id
     WHERE o.id = $1 AND o.deleted_at IS NULL`,
    [id]
  )

  if (!row) return null

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    furnitureDescription: row.furniture_description,
    quantity: row.quantity,
    salePrice: row.sale_price,
    paidAmount: row.paid_amount,
    remainingBalance: row.remaining_balance,
    deliveryDate: row.delivery_date,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export interface OrderPaymentSummary {
  id: string
  amount: string
  paymentDate: string
  method: PaymentMethod
  reference: string | null
}

export async function getOrderPayments(orderId: string): Promise<OrderPaymentSummary[]> {
  const rows = await query<{
    id: string
    amount: string
    payment_date: string
    method: PaymentMethod
    reference: string | null
  }>(
    `SELECT id, amount, payment_date, method, reference
     FROM payments
     WHERE order_id = $1 AND deleted_at IS NULL
     ORDER BY payment_date DESC, created_at DESC`,
    [orderId]
  )

  return rows.map((row) => ({
    id: row.id,
    amount: row.amount,
    paymentDate: row.payment_date,
    method: row.method,
    reference: row.reference,
  }))
}

export interface OrderInput {
  customerId: string
  furnitureDescription: string
  quantity: number
  salePrice: number
  deliveryDate: string | null
  status: OrderStatus
  notes: string
}

export interface OrderDeposit {
  amount: number
  method: PaymentMethod
}

export async function createOrder(
  input: OrderInput,
  deposit: OrderDeposit | null
): Promise<{ id: string }> {
  const id = randomUUID()

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO orders
         (id, customer_id, furniture_description, quantity, sale_price, delivery_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        input.customerId,
        input.furnitureDescription,
        input.quantity,
        input.salePrice,
        input.deliveryDate,
        input.status,
        input.notes || null,
      ]
    )

    if (deposit && deposit.amount > 0) {
      await client.query(
        "INSERT INTO payments (order_id, amount, method) VALUES ($1, $2, $3)",
        [id, deposit.amount, deposit.method]
      )
    }
  })

  return { id }
}

export async function updateOrder(id: string, input: OrderInput): Promise<void> {
  await query(
    `UPDATE orders
     SET customer_id = $1, furniture_description = $2, quantity = $3, sale_price = $4,
         delivery_date = $5, status = $6, notes = $7
     WHERE id = $8 AND deleted_at IS NULL`,
    [
      input.customerId,
      input.furnitureDescription,
      input.quantity,
      input.salePrice,
      input.deliveryDate,
      input.status,
      input.notes || null,
      id,
    ]
  )
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await query("UPDATE orders SET status = $1 WHERE id = $2 AND deleted_at IS NULL", [
    status,
    id,
  ])
}

export async function softDeleteOrder(id: string): Promise<void> {
  await query("UPDATE orders SET deleted_at = now() WHERE id = $1", [id])
}

export interface OrderOption {
  id: string
  orderNumber: string
  customerName: string
  remainingBalance: string
}

/** Lightweight list for the payment form's order picker - orders still owed on surface first. */
export async function listOrdersForSelect(): Promise<OrderOption[]> {
  const rows = await query<{
    id: string
    order_number: string
    customer_name: string
    remaining_balance: string
  }>(
    `SELECT
       o.id, o.order_number, c.name AS customer_name,
       COALESCE(ob.remaining_balance, o.sale_price) AS remaining_balance
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     LEFT JOIN order_balances ob ON ob.order_id = o.id
     WHERE o.deleted_at IS NULL
     ORDER BY remaining_balance DESC, o.order_number DESC`
  )

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    remainingBalance: row.remaining_balance,
  }))
}
