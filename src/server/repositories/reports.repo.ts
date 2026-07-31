import "server-only"

import { query, queryOne } from "@/lib/db"
import type { ExpenseCategory, OrderStatus, PaymentMethod } from "@/types/database"

export interface ReportPeriod {
  start: string
  end: string
}

export interface ReportSummary {
  revenue: string
  expenses: string
  profit: string
  paymentsReceived: string
  orderCount: number
}

export interface ReportOrderRow {
  orderNumber: string
  customerName: string
  furnitureDescription: string
  salePrice: string
  status: OrderStatus
  deliveryDate: string | null
  createdAt: string
}

export interface ReportExpenseRow {
  category: ExpenseCategory
  supplier: string | null
  amount: string
  invoiceNumber: string | null
  expenseDate: string
}

export interface ReportPaymentRow {
  orderNumber: string
  customerName: string
  amount: string
  method: PaymentMethod
  paymentDate: string
}

export interface ReportData {
  period: ReportPeriod
  summary: ReportSummary
  orders: ReportOrderRow[]
  expenses: ReportExpenseRow[]
  payments: ReportPaymentRow[]
}

export async function getReportData(period: ReportPeriod): Promise<ReportData> {
  const { start, end } = period

  const summaryRow = await queryOne<{
    revenue: string
    expenses: string
    payments_received: string
    order_count: number
  }>(
    `SELECT
       (SELECT COALESCE(SUM(sale_price), 0) FROM orders
         WHERE deleted_at IS NULL AND created_at::date BETWEEN $1 AND $2
       ) AS revenue,
       (SELECT COALESCE(SUM(amount), 0) FROM expenses
         WHERE deleted_at IS NULL AND expense_date BETWEEN $1 AND $2
       ) AS expenses,
       (SELECT COALESCE(SUM(amount), 0) FROM payments
         WHERE deleted_at IS NULL AND payment_date BETWEEN $1 AND $2
       ) AS payments_received,
       (SELECT COUNT(*)::int FROM orders
         WHERE deleted_at IS NULL AND created_at::date BETWEEN $1 AND $2
       ) AS order_count`,
    [start, end]
  )

  const revenue = summaryRow?.revenue ?? "0"
  const expenses = summaryRow?.expenses ?? "0"
  const profit = (Number(revenue) - Number(expenses)).toFixed(2)

  const orderRows = await query<{
    order_number: string
    customer_name: string
    furniture_description: string
    sale_price: string
    status: OrderStatus
    delivery_date: string | null
    created_at: string
  }>(
    `SELECT o.order_number, c.name AS customer_name, o.furniture_description, o.sale_price,
            o.status, o.delivery_date, o.created_at
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.deleted_at IS NULL AND o.created_at::date BETWEEN $1 AND $2
     ORDER BY o.created_at ASC`,
    [start, end]
  )

  const expenseRows = await query<{
    category: ExpenseCategory
    supplier: string | null
    amount: string
    invoice_number: string | null
    expense_date: string
  }>(
    `SELECT category, supplier, amount, invoice_number, expense_date
     FROM expenses
     WHERE deleted_at IS NULL AND expense_date BETWEEN $1 AND $2
     ORDER BY expense_date ASC`,
    [start, end]
  )

  const paymentRows = await query<{
    order_number: string
    customer_name: string
    amount: string
    method: PaymentMethod
    payment_date: string
  }>(
    `SELECT o.order_number, c.name AS customer_name, p.amount, p.method, p.payment_date
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     JOIN customers c ON c.id = o.customer_id
     WHERE p.deleted_at IS NULL AND p.payment_date BETWEEN $1 AND $2
     ORDER BY p.payment_date ASC`,
    [start, end]
  )

  return {
    period,
    summary: {
      revenue,
      expenses,
      profit,
      paymentsReceived: summaryRow?.payments_received ?? "0",
      orderCount: summaryRow?.order_count ?? 0,
    },
    orders: orderRows.map((row) => ({
      orderNumber: row.order_number,
      customerName: row.customer_name,
      furnitureDescription: row.furniture_description,
      salePrice: row.sale_price,
      status: row.status,
      deliveryDate: row.delivery_date,
      createdAt: row.created_at,
    })),
    expenses: expenseRows.map((row) => ({
      category: row.category,
      supplier: row.supplier,
      amount: row.amount,
      invoiceNumber: row.invoice_number,
      expenseDate: row.expense_date,
    })),
    payments: paymentRows.map((row) => ({
      orderNumber: row.order_number,
      customerName: row.customer_name,
      amount: row.amount,
      method: row.method,
      paymentDate: row.payment_date,
    })),
  }
}
