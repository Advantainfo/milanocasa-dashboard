import { StyleSheet, Text, View } from "@react-pdf/renderer"
import { pdfColors } from "@/server/pdf/styles"

const styles = StyleSheet.create({
  table: { borderWidth: 1, borderColor: pdfColors.border, borderRadius: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: pdfColors.border },
  tableRowLast: { flexDirection: "row" },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: pdfColors.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
  },
  cell: { padding: 6, fontSize: 9 },
  cellHeader: { padding: 6, fontSize: 9, fontWeight: 700 },
})

export interface PdfTableColumn {
  header: string
  width: string
  align?: "left" | "right"
}

export function Table({ columns, rows }: { columns: PdfTableColumn[]; rows: string[][] }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {columns.map((col, index) => (
          <Text
            key={index}
            style={[
              styles.cellHeader,
              { width: col.width, textAlign: col.align ?? "left" },
            ]}
          >
            {col.header}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={rowIndex === rows.length - 1 ? styles.tableRowLast : styles.tableRow}
        >
          {row.map((cell, cellIndex) => (
            <Text
              key={cellIndex}
              style={[
                styles.cell,
                {
                  width: columns[cellIndex].width,
                  textAlign: columns[cellIndex].align ?? "left",
                },
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}
