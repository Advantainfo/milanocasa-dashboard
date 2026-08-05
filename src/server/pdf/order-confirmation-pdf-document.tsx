import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import { formatDate } from "@/lib/format"
import { ORDER_STATUS_LABELS } from "@/lib/constants"
import type { OrderForPdf } from "@/server/repositories/orders.repo"
import type { CompanySettings } from "@/server/repositories/settings.repo"
import { formatCurrencyForPdf, formatPercentForPdf } from "@/server/pdf/format"
import { pdfColors } from "@/server/pdf/styles"

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: pdfColors.text },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: { width: 56, height: 56, marginBottom: 8, objectFit: "contain" },
  companyName: { fontSize: 22, fontWeight: 700, color: pdfColors.brand },
  companyMetaLine: { fontSize: 8, color: pdfColors.muted, marginTop: 3 },
  docMetaBlock: { alignItems: "flex-end" },
  docTitle: { fontSize: 14, fontWeight: 700, color: pdfColors.brand },
  docMetaLine: { fontSize: 9, color: pdfColors.muted, marginTop: 3 },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
    marginTop: 18,
    marginBottom: 18,
  },
  infoGrid: { flexDirection: "row", gap: 24, marginBottom: 20 },
  infoBlock: { flex: 1 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    color: pdfColors.brand,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    gap: 8,
  },
  infoLabel: { fontSize: 9, color: pdfColors.muted },
  infoValue: { fontSize: 9, textAlign: "right" },
  pricingSectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 16,
    color: pdfColors.brand,
  },
  pricingBox: { borderWidth: 1, borderColor: pdfColors.border, borderRadius: 4 },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
  },
  pricingRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: pdfColors.headerBackground,
  },
  pricingLabel: { fontSize: 10, color: pdfColors.muted },
  pricingValue: { fontSize: 10 },
  pricingLabelTotal: { fontSize: 11, fontWeight: 700 },
  pricingValueTotal: { fontSize: 11, fontWeight: 700 },
  notesBox: {
    borderWidth: 1,
    borderColor: pdfColors.border,
    borderRadius: 4,
    padding: 10,
  },
  notesLine: { fontSize: 9.5, marginBottom: 3, lineHeight: 1.4 },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: pdfColors.border,
    marginTop: 28,
    paddingTop: 10,
  },
  footerText: { fontSize: 8.5, color: pdfColors.muted, marginBottom: 2 },
})

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

interface OrderConfirmationPdfDocumentProps {
  order: OrderForPdf
  company: CompanySettings
}

export function OrderConfirmationPdfDocument({
  order,
  company,
}: OrderConfirmationPdfDocumentProps) {
  const total = Number(order.salePrice)
  const vatPercentage = Number(company.vatPercentage)
  const subtotal = total / (1 + vatPercentage / 100)
  const vatAmount = total - subtotal

  const companyMetaParts = [
    company.address,
    company.phone ? `Tel: ${company.phone}` : null,
    company.email,
  ].filter((part): part is string => Boolean(part))

  const noteLines = order.notes?.trim() ? order.notes.trim().split(/\r?\n/) : []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {company.logoUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={company.logoUrl} style={styles.logo} />
            )}
            <Text style={styles.companyName}>{company.companyName}</Text>
            {company.vatNumber && (
              <Text style={styles.companyMetaLine}>VAT Number: {company.vatNumber}</Text>
            )}
            {companyMetaParts.length > 0 && (
              <Text style={styles.companyMetaLine}>{companyMetaParts.join("  •  ")}</Text>
            )}
          </View>
          <View style={styles.docMetaBlock}>
            <Text style={styles.docTitle}>Order Confirmation</Text>
            <Text style={styles.docMetaLine}>Order Number: {order.orderNumber}</Text>
            <Text style={styles.docMetaLine}>Generated: {formatDate(new Date())}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <InfoRow label="Name" value={order.customer.name} />
            {order.customer.company && (
              <InfoRow label="Company" value={order.customer.company} />
            )}
            {order.customer.address && (
              <InfoRow label="Address" value={order.customer.address} />
            )}
            {order.customer.phone && <InfoRow label="Phone" value={order.customer.phone} />}
            {order.customer.email && <InfoRow label="Email" value={order.customer.email} />}
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <InfoRow label="Order Number" value={order.orderNumber} />
            <InfoRow label="Order Date" value={formatDate(order.createdAt)} />
            {order.deliveryDate && (
              <InfoRow label="Delivery Date" value={formatDate(order.deliveryDate)} />
            )}
            <InfoRow label="Status" value={ORDER_STATUS_LABELS[order.status]} />
            <InfoRow label="Furniture" value={order.furnitureDescription} />
            <InfoRow label="Quantity" value={String(order.quantity)} />
          </View>
        </View>

        <Text style={styles.pricingSectionTitle}>Order Details</Text>
        <View style={styles.pricingBox}>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Subtotal (Excl. VAT)</Text>
            <Text style={styles.pricingValue}>{formatCurrencyForPdf(subtotal)}</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>
              VAT ({formatPercentForPdf(vatPercentage)})
            </Text>
            <Text style={styles.pricingValue}>{formatCurrencyForPdf(vatAmount)}</Text>
          </View>
          <View style={styles.pricingRowTotal}>
            <Text style={styles.pricingLabelTotal}>Total (Incl. VAT)</Text>
            <Text style={styles.pricingValueTotal}>{formatCurrencyForPdf(total)}</Text>
          </View>
        </View>

        {noteLines.length > 0 && (
          <>
            <Text style={styles.pricingSectionTitle}>Order Description</Text>
            <View style={styles.notesBox}>
              {noteLines.map((line, index) => (
                <Text key={index} style={styles.notesLine}>
                  {line.length > 0 ? line : " "}
                </Text>
              ))}
            </View>
          </>
        )}

        <View style={styles.footerDivider}>
          <Text style={styles.footerText}>Thank you for your trust in Milano Casa.</Text>
          <Text style={styles.footerText}>
            This document confirms the agreed order details.
          </Text>
          {/*
            Future-ready: additional footer blocks (Signature, Payment
            Terms, Bank Details, Warranty Information, QR Code) can be
            added here as sibling Views without touching the layout above.
          */}
        </View>
      </Page>
    </Document>
  )
}
