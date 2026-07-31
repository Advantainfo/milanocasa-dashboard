import "server-only"

import { query, queryOne } from "@/lib/db"
import type { ExpenseCategory, OrderStatus, PaymentMethod } from "@/types/database"

export interface DashboardKpis {
  totalRevenue: string
  revenueThisMonth: string
  outstandingPayments: string
  expensesThisMonth: string
  netProfitThisMonth: string
  totalOrders: number
  totalCustomers: number
  pendingDeliveries: number
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const row = await queryOne<{
    total_revenue: string
    revenue_this_month: string
    outstanding_payments: string
    expenses_this_month: string
    total_orders: number
    total_customers: number
    pending_deliveries: number
  }>(`
    SELECT
      (SELECT COALESCE(SUM(sale_price), 0) FROM orders WHERE deleted_at IS NULL) AS total_revenue,
      (SELECT COALESCE(SUM(sale_price), 0) FROM orders
        WHERE deleted_at IS NULL AND date_trunc('month', created_at) = date_trunc('month', now())
      ) AS revenue_this_month,
      (SELECT COALESCE(SUM(remaining_balance), 0) FROM order_balances) AS outstanding_payments,
      (SELECT COALESCE(SUM(amount), 0) FROM expenses
        WHERE deleted_at IS NULL AND date_trunc('month', expense_date) = date_trunc('month', now())
      ) AS expenses_this_month,
      (SELECT COUNT(*)::int FROM orders WHERE deleted_at IS NULL) AS total_orders,
      (SELECT COUNT(*)::int FROM customers WHERE deleted_at IS NULL) AS total_customers,
      (SELECT COUNT(*)::int FROM orders
        WHERE deleted_at IS NULL AND status NOT IN ('delivered', 'paid')
      ) AS pending_deliveries
  `)

  const revenueThisMonth = row?.revenue_this_month ?? "0"
  const expensesThisMonth = row?.expenses_this_month ?? "0"
  const netProfitThisMonth = (
    Number(revenueThisMonth) - Number(expensesThisMonth)
  ).toFixed(2)

  return {
    totalRevenue: row?.total_revenue ?? "0",
    revenueThisMonth,
    outstandingPayments: row?.outstanding_payments ?? "0",
    expensesThisMonth,
    netProfitThisMonth,
    totalOrders: row?.total_orders ?? 0,
    totalCustomers: row?.total_customers ?? 0,
    pendingDeliveries: row?.pending_deliveries ?? 0,
  }
}

export interface MonthlyFinancials {
  month: string
  monthLabel: string
  revenue: string
  expenses: string
  profit: string
  cashIn: string
  cashFlow: string
}

/** Last `months` calendar months (oldest first), including months with no activity. */
export async function getMonthlyFinancials(months = 6): Promise<MonthlyFinancials[]> {
  const rows = await query<{
    month: string
    revenue: string
    expenses: string
    cash_in: string
    profit: string
    cash_flow: string
  }>(
    `WITH months AS (
       SELECT date_trunc('month', now()) - (n || ' months')::interval AS month
       FROM generate_series(0, $1 - 1) AS n
     ),
     revenue AS (
       SELECT date_trunc('month', created_at) AS month, SUM(sale_price) AS revenue
       FROM orders WHERE deleted_at IS NULL GROUP BY 1
     ),
     expenses AS (
       SELECT date_trunc('month', expense_date) AS month, SUM(amount) AS expenses
       FROM expenses WHERE deleted_at IS NULL GROUP BY 1
     ),
     payments AS (
       SELECT date_trunc('month', payment_date) AS month, SUM(amount) AS cash_in
       FROM payments WHERE deleted_at IS NULL GROUP BY 1
     )
     SELECT
       m.month,
       COALESCE(r.revenue, 0)::numeric(12,2) AS revenue,
       COALESCE(e.expenses, 0)::numeric(12,2) AS expenses,
       COALESCE(p.cash_in, 0)::numeric(12,2) AS cash_in,
       (COALESCE(r.revenue, 0) - COALESCE(e.expenses, 0))::numeric(12,2) AS profit,
       (COALESCE(p.cash_in, 0) - COALESCE(e.expenses, 0))::numeric(12,2) AS cash_flow
     FROM months m
     LEFT JOIN revenue r ON r.month = m.month
     LEFT JOIN expenses e ON e.month = m.month
     LEFT JOIN payments p ON p.month = m.month
     ORDER BY m.month ASC`,
    [months]
  )

  return rows.map((row) => {
    const date = new Date(row.month)
    return {
      month: row.month,
      monthLabel: new Intl.DateTimeFormat("it-IT", {
        month: "short",
        year: "2-digit",
        timeZone: "Europe/Rome",
      }).format(date),
      revenue: row.revenue,
      expenses: row.expenses,
      profit: row.profit,
      cashIn: row.cash_in,
      cashFlow: row.cash_flow,
    }
  })
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  salePrice: string
  status: OrderStatus
  createdAt: string
}

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const rows = await query<{
    id: string
    order_number: string
    customer_name: string
    sale_price: string
    status: OrderStatus
    created_at: string
  }>(
    `SELECT o.id, o.order_number, c.name AS customer_name, o.sale_price, o.status, o.created_at
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.deleted_at IS NULL
     ORDER BY o.created_at DESC
     LIMIT $1`,
    [limit]
  )

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    salePrice: row.sale_price,
    status: row.status,
    createdAt: row.created_at,
  }))
}

export interface RecentPayment {
  id: string
  orderId: string
  orderNumber: string
  customerName: string
  amount: string
  method: PaymentMethod
  paymentDate: string
}

export async function getRecentPayments(limit = 5): Promise<RecentPayment[]> {
  const rows = await query<{
    id: string
    order_id: string
    order_number: string
    customer_name: string
    amount: string
    method: PaymentMethod
    payment_date: string
  }>(
    `SELECT p.id, p.order_id, o.order_number, c.name AS customer_name, p.amount, p.method, p.payment_date
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     JOIN customers c ON c.id = o.customer_id
     WHERE p.deleted_at IS NULL
     ORDER BY p.created_at DESC
     LIMIT $1`,
    [limit]
  )

  return rows.map((row) => ({
    id: row.id,
    orderId: row.order_id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    amount: row.amount,
    method: row.method,
    paymentDate: row.payment_date,
  }))
}

export interface RecentExpense {
  id: string
  category: ExpenseCategory
  supplier: string | null
  amount: string
  expenseDate: string
}

export async function getRecentExpenses(limit = 5): Promise<RecentExpense[]> {
  const rows = await query<{
    id: string
    category: ExpenseCategory
    supplier: string | null
    amount: string
    expense_date: string
  }>(
    `SELECT id, category, supplier, amount, expense_date
     FROM expenses
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  )

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    supplier: row.supplier,
    amount: row.amount,
    expenseDate: row.expense_date,
  }))
}

export interface UpcomingDelivery {
  id: string
  orderNumber: string
  customerName: string
  furnitureDescription: string
  deliveryDate: string
  status: OrderStatus
}

export async function getUpcomingDeliveries(limit = 5): Promise<UpcomingDelivery[]> {
  const rows = await query<{
    id: string
    order_number: string
    customer_name: string
    furniture_description: string
    delivery_date: string
    status: OrderStatus
  }>(
    `SELECT o.id, o.order_number, c.name AS customer_name, o.furniture_description,
            o.delivery_date, o.status
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.deleted_at IS NULL
       AND o.delivery_date IS NOT NULL
       AND o.delivery_date >= current_date
       AND o.status NOT IN ('delivered', 'paid')
     ORDER BY o.delivery_date ASC
     LIMIT $1`,
    [limit]
  )

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    furnitureDescription: row.furniture_description,
    deliveryDate: row.delivery_date,
    status: row.status,
  }))
}

export interface OutstandingBalance {
  orderId: string
  orderNumber: string
  customerId: string
  customerName: string
  remainingBalance: string
}

export async function getOutstandingBalances(limit = 5): Promise<OutstandingBalance[]> {
  const rows = await query<{
    order_id: string
    order_number: string
    customer_id: string
    customer_name: string
    remaining_balance: string
  }>(
    `SELECT o.id AS order_id, o.order_number, c.id AS customer_id, c.name AS customer_name,
            ob.remaining_balance
     FROM order_balances ob
     JOIN orders o ON o.id = ob.order_id
     JOIN customers c ON c.id = o.customer_id
     WHERE ob.remaining_balance > 0
     ORDER BY ob.remaining_balance DESC
     LIMIT $1`,
    [limit]
  )

  return rows.map((row) => ({
    orderId: row.order_id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    remainingBalance: row.remaining_balance,
  }))
}
