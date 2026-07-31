import { renderToBuffer } from "@react-pdf/renderer"
import { verifySession } from "@/lib/auth/dal"
import { resolveReportPeriod, type ReportType } from "@/lib/report-period"
import { getReportData } from "@/server/repositories/reports.repo"
import { ReportPdfDocument } from "@/server/reports/report-pdf-document"

export async function GET(request: Request) {
  await verifySession()

  const url = new URL(request.url)
  const typeParam = url.searchParams.get("type")
  const type: ReportType =
    typeParam === "yearly" || typeParam === "custom" ? typeParam : "monthly"
  const year = Number(url.searchParams.get("year")) || new Date().getFullYear()
  const month = Number(url.searchParams.get("month")) || new Date().getMonth() + 1
  const start = url.searchParams.get("start") || ""
  const end = url.searchParams.get("end") || ""

  const period = resolveReportPeriod({ type, year, month, start, end })
  const data = await getReportData(period)

  const buffer = await renderToBuffer(<ReportPdfDocument data={data} />)

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="milano-casa-report-${period.start}_${period.end}.pdf"`,
    },
  })
}
