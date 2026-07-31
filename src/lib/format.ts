// Not every Node/ICU build ships full CLDR grouping data for it-IT (observed:
// Intl.NumberFormat('it-IT').format(7600) => "7600" instead of "7.600" on some
// installs, silently dropping the thousands separator). Currency appears
// everywhere in this app, so its grouping is built manually rather than left
// to whatever locale data happens to be present on the deploy target.
function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

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

export function formatCurrency(value: number | string): string {
  const num = Number(value)
  const sign = num < 0 ? "-" : ""
  const [intPart, decPart] = Math.abs(num).toFixed(2).split(".")
  return `${sign}${groupThousands(intPart)},${decPart} €`
}

export function formatDate(value: string | Date): string {
  return DATE_FORMATTER.format(new Date(value))
}

export function formatDateTime(value: string | Date): string {
  return DATE_TIME_FORMATTER.format(new Date(value))
}

export function formatNumber(value: number | string): string {
  const num = Number(value)
  const sign = num < 0 ? "-" : ""
  const [intPart, decPart] = Math.abs(num)
    .toFixed(Number.isInteger(num) ? 0 : 2)
    .split(".")
  return decPart
    ? `${sign}${groupThousands(intPart)},${decPart}`
    : `${sign}${groupThousands(intPart)}`
}
