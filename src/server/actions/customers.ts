"use server"

import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/auth/dal"
import { isUniqueViolation } from "@/lib/db-errors"
import { customerSchema } from "@/lib/validation/customers"
import {
  createCustomer,
  softDeleteCustomer,
  updateCustomer,
} from "@/server/repositories/customers.repo"

export interface CustomerFormState {
  fieldErrors?: Record<string, string[]>
  formError?: string
}

const DUPLICATE_VAT_ERROR = "A customer with this VAT number already exists."

function parseCustomerFormData(formData: FormData) {
  return customerSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    vatNumber: formData.get("vatNumber"),
    address: formData.get("address"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  })
}

export async function createCustomerAction(
  _prevState: CustomerFormState | undefined,
  formData: FormData
): Promise<CustomerFormState> {
  await verifySession()

  const parsed = parseCustomerFormData(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  try {
    await createCustomer(parsed.data)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { formError: DUPLICATE_VAT_ERROR }
    }
    throw error
  }

  revalidatePath("/customers")
  return {}
}

export async function updateCustomerAction(
  _prevState: CustomerFormState | undefined,
  formData: FormData
): Promise<CustomerFormState> {
  await verifySession()

  const id = formData.get("id")
  if (typeof id !== "string" || !id) {
    return { formError: "Missing customer id." }
  }

  const parsed = parseCustomerFormData(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateCustomer(id, parsed.data)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { formError: DUPLICATE_VAT_ERROR }
    }
    throw error
  }

  revalidatePath("/customers")
  revalidatePath(`/customers/${id}`)
  return {}
}

export async function deleteCustomerAction(id: string): Promise<void> {
  await verifySession()
  await softDeleteCustomer(id)
  revalidatePath("/customers")
}
