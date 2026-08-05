import type {
  ExpenseCategory,
  OrderJobType,
  OrderStatus,
  PaymentMethod,
} from "@/types/database"

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  in_production: "In Production",
  ready: "Ready",
  delivered: "Delivered",
  paid: "Paid",
}

/** Badge color tokens, keyed to the same status values, applied via the shared StatusBadge component. */
export const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "neutral" | "info" | "warning" | "success" | "positive"
> = {
  new: "neutral",
  in_production: "info",
  ready: "warning",
  delivered: "success",
  paid: "positive",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank: "Bank",
  card: "Card",
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  materials: "Materials",
  transport: "Transport",
  fuel: "Fuel",
  rent: "Rent",
  utilities: "Utilities",
  equipment: "Equipment",
  other: "Other",
}

export const ORDER_JOB_TYPE_LABELS: Record<OrderJobType, string> = {
  personal_sale: "Personal Sale",
  shared_project: "Shared Project",
}

export const ORDER_JOB_TYPE_BADGE_VARIANT: Record<
  OrderJobType,
  "neutral" | "info" | "warning" | "success" | "positive"
> = {
  personal_sale: "neutral",
  shared_project: "info",
}

export const DEFAULT_PAGE_SIZE = 20
