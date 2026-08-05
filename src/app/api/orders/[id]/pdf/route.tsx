import { renderToBuffer } from "@react-pdf/renderer"
import { verifySession } from "@/lib/auth/dal"
import { getOrderForCustomerPdf } from "@/server/repositories/orders.repo"
import { getCompanySettings } from "@/server/repositories/settings.repo"
import { OrderConfirmationPdfDocument } from "@/server/pdf/order-confirmation-pdf-document"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await verifySession()

  const { id } = await params
  const [order, company] = await Promise.all([
    getOrderForCustomerPdf(id),
    getCompanySettings(),
  ])

  if (!order) {
    return new Response("Order not found.", { status: 404 })
  }

  const buffer = await renderToBuffer(
    <OrderConfirmationPdfDocument order={order} company={company} />
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="milano-casa-order-${order.orderNumber}.pdf"`,
    },
  })
}
