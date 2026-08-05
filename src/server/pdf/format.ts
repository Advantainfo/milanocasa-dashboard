// @react-pdf/renderer's standard-14 fonts (Helvetica, Times-Roman, Courier -
// verified across all three) silently drop the euro glyph (U+20AC) instead
// of erroring, so every amount would render with no currency symbol at all.
// "EUR" avoids the missing-glyph issue entirely; the web UI and Excel export
// keep the real € symbol since neither has this font limitation.
export function formatCurrencyForPdf(value: number | string): string {
  const num = Number(value)
  const sign = num < 0 ? "-" : ""
  const [intPart, decPart] = Math.abs(num).toFixed(2).split(".")
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${sign}${grouped},${decPart} EUR`
}

export function formatPercentForPdf(value: number | string): string {
  const num = Number(value)
  return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)}%`
}
