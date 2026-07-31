"use server"

import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/auth/dal"
import { orderCreateSchema, orderFieldsSchema } from "@/lib/validation/orders"
import {
  createOrder,
  softDeleteOrder,
  updateOrder,
  updateOrderStatus,
  type OrderInput,
} from "@/server/repositories/orders.repo"
import { ORDER_STATUSES, type OrderStatus } from "@/types/database"

export interface OrderFormState {
  fieldErrors?: Record<string, string[]>
  formError?: string
}

function toOrderInput(data: {
  customerId: string
  furnitureDescription: string
  quantity: string
  salePrice: string
  deliveryDate: string
  status: OrderStatus
  notes: string
}): OrderInput {
  return {
    customerId: data.customerId,
    furnitureDescription: data.furnitureDescription,
    quantity: Number(data.quantity),
    salePrice: Number(data.salePrice),
    deliveryDate: data.deliveryDate || null,
    status: data.status,
    notes: data.notes,
  }
}

export async function createOrderAction(
  _prevState: OrderFormState | undefined,
  formData: FormData
): Promise<OrderFormState> {
  await verifySession()

  const parsed = orderCreateSchema.safeParse({
    customerId: formData.get("customerId"),
    furnitureDescription: formData.get("furnitureDescription"),
    quantity: formData.get("quantity"),
    salePrice: formData.get("salePrice"),
    deliveryDate: formData.get("deliveryDate"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    depositAmount: formData.get("depositAmount"),
    depositMethod: formData.get("depositMethod") || undefined,
  })

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const depositAmount = Number(parsed.data.depositAmount)
  const deposit =
    depositAmount > 0 && parsed.data.depositMethod
      ? { amount: depositAmount, method: parsed.data.depositMethod }
      : null

  await createOrder(toOrderInput(parsed.data), deposit)

  revalidatePath("/orders")
  revalidatePath("/customers")
  return {}
}

export async function updateOrderAction(
  _prevState: OrderFormState | undefined,
  formData: FormData
): Promise<OrderFormState> {
  await verifySession()

  const id = formData.get("id")
  if (typeof id !== "string" || !id) {
    return { formError: "Missing order id." }
  }

  const parsed = orderFieldsSchema.safeParse({
    customerId: formData.get("customerId"),
    furnitureDescription: formData.get("furnitureDescription"),
    quantity: formData.get("quantity"),
    salePrice: formData.get("salePrice"),
    deliveryDate: formData.get("deliveryDate"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  })

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  await updateOrder(id, toOrderInput(parsed.data))

  revalidatePath("/orders")
  revalidatePath(`/orders/${id}`)
  revalidatePath("/customers")
  return {}
}

export async function updateOrderStatusAction(id: string, status: string): Promise<void> {
  await verifySession()

  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Invalid order status.")
  }

  await updateOrderStatus(id, status as OrderStatus)
  revalidatePath("/orders")
  revalidatePath(`/orders/${id}`)
}

export async function deleteOrderAction(id: string): Promise<void> {
  await verifySession()
  await softDeleteOrder(id)
  revalidatePath("/orders")
  revalidatePath("/customers")
}
