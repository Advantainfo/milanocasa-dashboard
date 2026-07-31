import "server-only"

import { query, queryOne } from "@/lib/db"

export interface CustomerListItem {
  id: string
  name: string
  company: string | null
  vatNumber: string | null
  address: string | null
  email: string | null
  phone: string | null
  notes: string | null
  totalOrders: number
  totalRevenue: string
  outstandingBalance: string
}

export type CustomerSortColumn =
  "name" | "totalOrders" | "totalRevenue" | "outstandingBalance" | "createdAt"

export type SortDirection = "asc" | "desc"

const SORT_COLUMN_SQL: Record<CustomerSortColumn, string> = {
  name: "c.name",
  totalOrders: "total_orders",
  totalRevenue: "total_revenue",
  outstandingBalance: "outstanding_balance",
  createdAt: "c.created_at",
}

export interface ListCustomersParams {
  search?: string
  page: number
  pageSize: number
  sortBy: CustomerSortColumn
  sortDir: SortDirection
}

interface CustomerListRow {
  id: string
  name: string
  company: string | null
  vat_number: string | null
  address: string | null
  email: string | null
  phone: string | null
  notes: string | null
  total_orders: number
  total_revenue: string
  outstanding_balance: string
}

function toCustomerListItem(row: CustomerListRow): CustomerListItem {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    vatNumber: row.vat_number,
    address: row.address,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    totalOrders: row.total_orders,
    totalRevenue: row.total_revenue,
    outstandingBalance: row.outstanding_balance,
  }
}

export async function listCustomers(
  params: ListCustomersParams
): Promise<{ items: CustomerListItem[]; totalCount: number }> {
  const { search, page, pageSize, sortBy, sortDir } = params
  const searchTerm = search?.trim() || null
  const offset = (page - 1) * pageSize

  const whereClause = searchTerm
    ? `WHERE c.deleted_at IS NULL AND (
        c.name ILIKE '%' || $1 || '%' OR
        c.company ILIKE '%' || $1 || '%' OR
        c.email ILIKE '%' || $1 || '%' OR
        c.phone ILIKE '%' || $1 || '%'
      )`
    : "WHERE c.deleted_at IS NULL"

  const orderColumn = SORT_COLUMN_SQL[sortBy]
  const orderDirection = sortDir === "asc" ? "ASC" : "DESC"

  const totalCountRow = await queryOne<{ count: number }>(
    `SELECT count(*)::int AS count FROM customers c ${whereClause}`,
    searchTerm ? [searchTerm] : []
  )

  const dataParams = searchTerm ? [searchTerm, pageSize, offset] : [pageSize, offset]
  const limitPlaceholder = searchTerm ? "$2" : "$1"
  const offsetPlaceholder = searchTerm ? "$3" : "$2"

  const rows = await query<CustomerListRow>(
    `SELECT
       c.id, c.name, c.company, c.vat_number, c.address, c.email, c.phone, c.notes,
       COUNT(o.id)::int AS total_orders,
       COALESCE(SUM(o.sale_price), 0)::numeric(12,2) AS total_revenue,
       COALESCE(SUM(ob.remaining_balance), 0)::numeric(12,2) AS outstanding_balance
     FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id AND o.deleted_at IS NULL
     LEFT JOIN order_balances ob ON ob.order_id = o.id
     ${whereClause}
     GROUP BY c.id
     ORDER BY ${orderColumn} ${orderDirection}
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    dataParams
  )

  return {
    items: rows.map(toCustomerListItem),
    totalCount: totalCountRow?.count ?? 0,
  }
}

export interface CustomerDetail {
  id: string
  name: string
  company: string | null
  vatNumber: string | null
  address: string | null
  email: string | null
  phone: string | null
  notes: string | null
  createdAt: string
  totalOrders: number
  totalRevenue: string
  outstandingBalance: string
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  const row = await queryOne<{
    id: string
    name: string
    company: string | null
    vat_number: string | null
    address: string | null
    email: string | null
    phone: string | null
    notes: string | null
    created_at: string
    total_orders: number
    total_revenue: string
    outstanding_balance: string
  }>(
    `SELECT
       c.id, c.name, c.company, c.vat_number, c.address, c.email, c.phone, c.notes, c.created_at,
       COUNT(o.id)::int AS total_orders,
       COALESCE(SUM(o.sale_price), 0)::numeric(12,2) AS total_revenue,
       COALESCE(SUM(ob.remaining_balance), 0)::numeric(12,2) AS outstanding_balance
     FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id AND o.deleted_at IS NULL
     LEFT JOIN order_balances ob ON ob.order_id = o.id
     WHERE c.id = $1 AND c.deleted_at IS NULL
     GROUP BY c.id`,
    [id]
  )

  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    company: row.company,
    vatNumber: row.vat_number,
    address: row.address,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    createdAt: row.created_at,
    totalOrders: row.total_orders,
    totalRevenue: row.total_revenue,
    outstandingBalance: row.outstanding_balance,
  }
}

export interface CustomerOrderSummary {
  id: string
  orderNumber: string
  furnitureDescription: string
  salePrice: string
  remainingBalance: string
  status: string
  deliveryDate: string | null
}

export async function getCustomerOrders(
  customerId: string,
  limit = 10
): Promise<CustomerOrderSummary[]> {
  const rows = await query<{
    id: string
    order_number: string
    furniture_description: string
    sale_price: string
    remaining_balance: string
    status: string
    delivery_date: string | null
  }>(
    `SELECT o.id, o.order_number, o.furniture_description, o.sale_price,
            ob.remaining_balance, o.status, o.delivery_date
     FROM orders o
     LEFT JOIN order_balances ob ON ob.order_id = o.id
     WHERE o.customer_id = $1 AND o.deleted_at IS NULL
     ORDER BY o.created_at DESC
     LIMIT $2`,
    [customerId, limit]
  )

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    furnitureDescription: row.furniture_description,
    salePrice: row.sale_price,
    remainingBalance: row.remaining_balance,
    status: row.status,
    deliveryDate: row.delivery_date,
  }))
}

export interface CustomerInput {
  name: string
  company: string
  vatNumber: string
  address: string
  email: string
  phone: string
  notes: string
}

export async function createCustomer(input: CustomerInput): Promise<{ id: string }> {
  const row = await queryOne<{ id: string }>(
    `INSERT INTO customers (name, company, vat_number, address, email, phone, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      input.name,
      input.company || null,
      input.vatNumber || null,
      input.address || null,
      input.email || null,
      input.phone || null,
      input.notes || null,
    ]
  )

  if (!row) throw new Error("Failed to create customer.")
  return row
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<void> {
  await query(
    `UPDATE customers
     SET name = $1, company = $2, vat_number = $3, address = $4, email = $5, phone = $6, notes = $7
     WHERE id = $8 AND deleted_at IS NULL`,
    [
      input.name,
      input.company || null,
      input.vatNumber || null,
      input.address || null,
      input.email || null,
      input.phone || null,
      input.notes || null,
      id,
    ]
  )
}

export async function softDeleteCustomer(id: string): Promise<void> {
  await query("UPDATE customers SET deleted_at = now() WHERE id = $1", [id])
}
