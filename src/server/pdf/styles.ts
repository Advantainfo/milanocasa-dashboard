// Shared color/spacing tokens so every PDF document (business report, order
// confirmation, and future quotations/invoices) looks like one consistent
// document family instead of each file re-declaring its own hex values.
export const pdfColors = {
  text: "#111111",
  muted: "#666666",
  border: "#e5e5e5",
  headerBackground: "#f5f5f5",
  brand: "#1f1f1f",
} as const

export const pdfSpacing = {
  pagePadding: 32,
} as const
