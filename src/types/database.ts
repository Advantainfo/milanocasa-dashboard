/** Mirrors the Postgres enum types created in migrations/0001_init.sql. */

export const ORDER_STATUSES = [
  "new",
  "in_production",
  "ready",
  "delivered",
  "paid",
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_METHODS = ["cash", "bank", "card"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const EXPENSE_CATEGORIES = [
  "materials",
  "transport",
  "fuel",
  "rent",
  "utilities",
  "equipment",
  "other",
] as const
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const ORDER_JOB_TYPES = ["personal_sale", "shared_project"] as const
export type OrderJobType = (typeof ORDER_JOB_TYPES)[number]
