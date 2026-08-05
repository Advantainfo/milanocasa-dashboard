import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import { formatDate } from "@/lib/format"
import {
  EXPENSE_CATEGORY_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants"
import type { ReportData } from "@/server/repositories/reports.repo"
import { formatCurrencyForPdf } from "@/server/pdf/format"
import { Table } from "@/server/pdf/table"

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#111111" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 11, color: "#666666", marginBottom: 20 },
  summaryRow: { flexDirection: "row", marginBottom: 20, gap: 12 },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
    padding: 8,
  },
  summaryLabel: { fontSize: 8, color: "#666666", marginBottom: 4 },
  summaryValue: { fontSize: 13, fontWeight: 700 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 9, color: "#666666", marginBottom: 8 },
})

export function ReportPdfDocument({ data }: { data: ReportData }) {
  const { period, summary, orders, expenses, payments } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Milano Casa</Text>
        <Text style={styles.subtitle}>
          Business report - {period.start} to {period.end}
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Revenue</Text>
            <Text style={styles.summaryValue}>
              {formatCurrencyForPdf(summary.revenue)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryValue}>
              {formatCurrencyForPdf(summary.expenses)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Profit</Text>
            <Text style={styles.summaryValue}>
              {formatCurrencyForPdf(summary.profit)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Payments Received</Text>
            <Text style={styles.summaryValue}>
              {formatCurrencyForPdf(summary.paymentsReceived)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Orders</Text>
            <Text style={styles.summaryValue}>{summary.orderCount}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Orders ({orders.length})</Text>
        {orders.length === 0 ? (
          <Text style={styles.emptyText}>No orders in this period.</Text>
        ) : (
          <Table
            columns={[
              { header: "Order", width: "15%" },
              { header: "Customer", width: "25%" },
              { header: "Furniture", width: "30%" },
              { header: "Sale Price", width: "15%", align: "right" },
              { header: "Status", width: "15%" },
            ]}
            rows={orders.map((order) => [
              order.orderNumber,
              order.customerName,
              order.furnitureDescription,
              formatCurrencyForPdf(order.salePrice),
              ORDER_STATUS_LABELS[order.status],
            ])}
          />
        )}

        <Text style={styles.sectionTitle}>Expenses ({expenses.length})</Text>
        {expenses.length === 0 ? (
          <Text style={styles.emptyText}>No expenses in this period.</Text>
        ) : (
          <Table
            columns={[
              { header: "Date", width: "20%" },
              { header: "Category", width: "25%" },
              { header: "Supplier", width: "35%" },
              { header: "Amount", width: "20%", align: "right" },
            ]}
            rows={expenses.map((expense) => [
              formatDate(expense.expenseDate),
              EXPENSE_CATEGORY_LABELS[expense.category],
              expense.supplier || "-",
              formatCurrencyForPdf(expense.amount),
            ])}
          />
        )}

        <Text style={styles.sectionTitle}>Payments ({payments.length})</Text>
        {payments.length === 0 ? (
          <Text style={styles.emptyText}>No payments in this period.</Text>
        ) : (
          <Table
            columns={[
              { header: "Date", width: "20%" },
              { header: "Order", width: "25%" },
              { header: "Method", width: "25%" },
              { header: "Amount", width: "30%", align: "right" },
            ]}
            rows={payments.map((payment) => [
              formatDate(payment.paymentDate),
              payment.orderNumber,
              PAYMENT_METHOD_LABELS[payment.method],
              formatCurrencyForPdf(payment.amount),
            ])}
          />
        )}
      </Page>
    </Document>
  )
}
