import ExcelJS from "exceljs"
import { verifySession } from "@/lib/auth/dal"
import { formatDate } from "@/lib/format"
import {
  EXPENSE_CATEGORY_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants"
import { resolveReportPeriod, type ReportType } from "@/lib/report-period"
import { getReportData } from "@/server/repositories/reports.repo"

const CURRENCY_FORMAT = '#,##0.00 "€"'
const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF3F3F1" },
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.font = { bold: true }
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL
  })
}

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

  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Milano Casa"
  workbook.created = new Date()

  const summarySheet = workbook.addWorksheet("Summary")
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 24 },
    { header: "Value", key: "value", width: 18 },
  ]
  styleHeaderRow(summarySheet.getRow(1))
  summarySheet.addRow({ metric: "Period", value: period.label })
  summarySheet.addRow({ metric: "Revenue", value: Number(data.summary.revenue) })
  summarySheet.addRow({ metric: "Expenses", value: Number(data.summary.expenses) })
  summarySheet.addRow({ metric: "Profit", value: Number(data.summary.profit) })
  summarySheet.addRow({
    metric: "Payments Received",
    value: Number(data.summary.paymentsReceived),
  })
  summarySheet.addRow({ metric: "Orders", value: data.summary.orderCount })
  for (let i = 2; i <= 5; i++) {
    summarySheet.getCell(`B${i}`).numFmt = CURRENCY_FORMAT
  }

  const ordersSheet = workbook.addWorksheet("Orders")
  ordersSheet.columns = [
    { header: "Order Number", key: "orderNumber", width: 16 },
    { header: "Customer", key: "customerName", width: 24 },
    { header: "Furniture", key: "furnitureDescription", width: 30 },
    { header: "Sale Price", key: "salePrice", width: 14 },
    { header: "Status", key: "status", width: 16 },
    { header: "Delivery Date", key: "deliveryDate", width: 16 },
  ]
  styleHeaderRow(ordersSheet.getRow(1))
  data.orders.forEach((order) => {
    ordersSheet.addRow({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      furnitureDescription: order.furnitureDescription,
      salePrice: Number(order.salePrice),
      status: ORDER_STATUS_LABELS[order.status],
      deliveryDate: order.deliveryDate ? formatDate(order.deliveryDate) : "",
    })
  })
  ordersSheet.getColumn("salePrice").numFmt = CURRENCY_FORMAT

  const expensesSheet = workbook.addWorksheet("Expenses")
  expensesSheet.columns = [
    { header: "Date", key: "expenseDate", width: 14 },
    { header: "Category", key: "category", width: 16 },
    { header: "Supplier", key: "supplier", width: 24 },
    { header: "Invoice Number", key: "invoiceNumber", width: 18 },
    { header: "Amount", key: "amount", width: 14 },
  ]
  styleHeaderRow(expensesSheet.getRow(1))
  data.expenses.forEach((expense) => {
    expensesSheet.addRow({
      expenseDate: formatDate(expense.expenseDate),
      category: EXPENSE_CATEGORY_LABELS[expense.category],
      supplier: expense.supplier ?? "",
      invoiceNumber: expense.invoiceNumber ?? "",
      amount: Number(expense.amount),
    })
  })
  expensesSheet.getColumn("amount").numFmt = CURRENCY_FORMAT

  const paymentsSheet = workbook.addWorksheet("Payments")
  paymentsSheet.columns = [
    { header: "Date", key: "paymentDate", width: 14 },
    { header: "Order Number", key: "orderNumber", width: 16 },
    { header: "Customer", key: "customerName", width: 24 },
    { header: "Method", key: "method", width: 14 },
    { header: "Amount", key: "amount", width: 14 },
  ]
  styleHeaderRow(paymentsSheet.getRow(1))
  data.payments.forEach((payment) => {
    paymentsSheet.addRow({
      paymentDate: formatDate(payment.paymentDate),
      orderNumber: payment.orderNumber,
      customerName: payment.customerName,
      method: PAYMENT_METHOD_LABELS[payment.method],
      amount: Number(payment.amount),
    })
  })
  paymentsSheet.getColumn("amount").numFmt = CURRENCY_FORMAT

  const buffer = await workbook.xlsx.writeBuffer()

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="milano-casa-report-${period.start}_${period.end}.xlsx"`,
    },
  })
}
