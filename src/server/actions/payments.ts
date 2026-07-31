"use server"

import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/auth/dal"
import { paymentFieldsSchema } from "@/lib/validation/payments"
import {
  createPayment,
  softDeletePayment,
  updatePayment,
  type PaymentInput,
} from "@/server/repositories/payments.repo"

export interface PaymentFormState {
  fieldErrors?: Record<string, string[]>
  formError?: string
}

function toPaymentInput(data: {
  orderId: string
  amount: string
  paymentDate: string
  method: PaymentInput["method"]
  reference: string
  notes: string
}): PaymentInput {
  return {
    orderId: data.orderId,
    amount: Number(data.amount),
    paymentDate: data.paymentDate,
    method: data.method,
    reference: data.reference,
    notes: data.notes,
  }
}

function parsePaymentFormData(formData: FormData) {
  return paymentFieldsSchema.safeParse({
    orderId: formData.get("orderId"),
    amount: formData.get("amount"),
    paymentDate: formData.get("paymentDate"),
    method: formData.get("method"),
    reference: formData.get("reference"),
    notes: formData.get("notes"),
  })
}

function revalidateAfterMutation(orderId: string) {
  revalidatePath("/payments")
  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/customers")
}

export async function createPaymentAction(
  _prevState: PaymentFormState | undefined,
  formData: FormData
): Promise<PaymentFormState> {
  await verifySession()

  const parsed = parsePaymentFormData(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  await createPayment(toPaymentInput(parsed.data))
  revalidateAfterMutation(parsed.data.orderId)
  return {}
}

export async function updatePaymentAction(
  _prevState: PaymentFormState | undefined,
  formData: FormData
): Promise<PaymentFormState> {
  await verifySession()

  const id = formData.get("id")
  if (typeof id !== "string" || !id) {
    return { formError: "Missing payment id." }
  }

  const parsed = parsePaymentFormData(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  await updatePayment(id, toPaymentInput(parsed.data))
  revalidateAfterMutation(parsed.data.orderId)
  return {}
}

export async function deletePaymentAction(id: string, orderId: string): Promise<void> {
  await verifySession()
  await softDeletePayment(id)
  revalidateAfterMutation(orderId)
}
