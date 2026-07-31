import type { Metadata } from "next"
import { resolveReportPeriod, type ReportType } from "@/lib/report-period"
import { getReportData } from "@/server/repositories/reports.repo"
import { ReportsToolbar } from "@/components/reports/reports-toolbar"
import { ReportPreview } from "@/components/reports/report-preview"

export const metadata: Metadata = { title: "Reports | Milano Casa" }

interface ReportsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams
  const now = new Date()

  const type: ReportType =
    params.type === "yearly" || params.type === "custom" ? params.type : "monthly"
  const year = Number(params.year) || now.getFullYear()
  const month = Number(params.month) || now.getMonth() + 1
  const start = typeof params.start === "string" ? params.start : ""
  const end = typeof params.end === "string" ? params.end : ""

  const period = resolveReportPeriod({ type, year, month, start, end })
  const data = await getReportData(period)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
        <p className="text-muted-foreground text-sm">{period.label}</p>
      </div>
      <ReportsToolbar
        type={type}
        year={year}
        month={month}
        start={start || period.start}
        end={end || period.end}
      />
      <ReportPreview data={data} />
    </div>
  )
}
