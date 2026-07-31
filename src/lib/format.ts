const CURRENCY_FORMATTER = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
})

// Pinned explicitly (rather than relying on the server process's local
// timezone) so dates render the same regardless of which region the app is
// deployed to.
const DISPLAY_TIME_ZONE = "Europe/Rome"

const DATE_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: DISPLAY_TIME_ZONE,
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: DISPLAY_TIME_ZONE,
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
