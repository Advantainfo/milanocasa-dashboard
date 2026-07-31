"use server"

import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/auth/dal"
import { isUniqueViolation } from "@/lib/db-errors"
import { expenseFieldsSchema } from "@/lib/validation/expenses"
import {
  createExpense,
  softDeleteExpense,
  updateExpense,
  type ExpenseInput,
} from "@/server/repositories/expenses.repo"

export interface ExpenseFormState {
  fieldErrors?: Record<string, string[]>
  formError?: string
}

const DUPLICATE_INVOICE_ERROR =
  "An expense with this supplier and invoice number already exists."

function toExpenseInput(data: {
  category: ExpenseInput["category"]
  supplier: string
  amount: string
  invoiceNumber: string
  expenseDate: string
  notes: string
}): ExpenseInput {
  return {
    category: data.category,
    supplier: data.supplier,
    amount: Number(data.amount),
    invoiceNumber: data.invoiceNumber,
    expenseDate: data.expenseDate,
    notes: data.notes,
  }
}

function parseExpenseFormData(formData: FormData) {
  return expenseFieldsSchema.safeParse({
    category: formData.get("category"),
    supplier: formData.get("supplier"),
    amount: formData.get("amount"),
    invoiceNumber: formData.get("invoiceNumber"),
    expenseDate: formData.get("expenseDate"),
    notes: formData.get("notes"),
  })
}

export async function createExpenseAction(
  _prevState: ExpenseFormState | undefined,
  formData: FormData
): Promise<ExpenseFormState> {
  await verifySession()

  const parsed = parseExpenseFormData(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  try {
    await createExpense(toExpenseInput(parsed.data))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { formError: DUPLICATE_INVOICE_ERROR }
    }
    throw error
  }

  revalidatePath("/expenses")
  return {}
}

export async function updateExpenseAction(
  _prevState: ExpenseFormState | undefined,
  formData: FormData
): Promise<ExpenseFormState> {
  await verifySession()

  const id = formData.get("id")
  if (typeof id !== "string" || !id) {
    return { formError: "Missing expense id." }
  }

  const parsed = parseExpenseFormData(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateExpense(id, toExpenseInput(parsed.data))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { formError: DUPLICATE_INVOICE_ERROR }
    }
    throw error
  }

  revalidatePath("/expenses")
  return {}
}

export async function deleteExpenseAction(id: string): Promise<void> {
  await verifySession()
  await softDeleteExpense(id)
  revalidatePath("/expenses")
}
