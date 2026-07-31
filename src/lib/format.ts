const CURRENCY_FORMATTER = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
})

const DATE_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const NUMBER_FORMATTER = new Intl.NumberFormat("it-IT")

export function formatCurrency(value: number | string): string {
  return CURRENCY_FORMATTER.format(Number(value))
}

export function formatDate(value: string | Date): string {
  return DATE_FORMATTER.format(new Date(value))
}

export function formatDateTime(value: string | Date): string {
  return DATE_TIME_FORMATTER.format(new Date(value))
}

export function formatNumber(value: number | string): string {
  return NUMBER_FORMATTER.format(Number(value))
}

/** Formats a Date as `YYYY-MM-DD` for date-only Postgres columns / <input type="date">. */
export function toDateInputValue(value: string | Date): string {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
