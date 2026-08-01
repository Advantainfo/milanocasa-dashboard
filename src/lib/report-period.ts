import { formatDate } from "@/lib/format"

export type ReportType = "monthly" | "yearly" | "custom"

export interface ResolvedReportPeriod {
  start: string
  end: string
  label: string
}

export const DEFAULT_MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

/** Computed with UTC date arithmetic only - never touches wall-clock/local time. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export interface ReportPeriodInput {
  type: ReportType
  year: number
  month?: number
  start?: string
  end?: string
  monthLabels?: readonly string[]
}

export function resolveReportPeriod(input: ReportPeriodInput): ResolvedReportPeriod {
  const monthLabels = input.monthLabels ?? DEFAULT_MONTH_LABELS

  if (input.type === "monthly") {
    const month = input.month && input.month >= 1 && input.month <= 12 ? input.month : 1
    const start = `${input.year}-${pad(month)}-01`
    const end = `${input.year}-${pad(month)}-${pad(daysInMonth(input.year, month))}`
    return { start, end, label: `${monthLabels[month - 1]} ${input.year}` }
  }

  if (input.type === "yearly") {
    return {
      start: `${input.year}-01-01`,
      end: `${input.year}-12-31`,
      label: String(input.year),
    }
  }

  const start = input.start || `${input.year}-01-01`
  const end = input.end || `${input.year}-12-31`
  return { start, end, label: `${formatDate(start)} – ${formatDate(end)}` }
}
