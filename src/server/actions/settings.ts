"use server"

import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/auth/dal"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { query, queryOne } from "@/lib/db"
import { changePasswordSchema, companySettingsSchema } from "@/lib/validation/settings"
import { updateCompanySettings } from "@/server/repositories/settings.repo"

export interface SettingsFormState {
  fieldErrors?: Record<string, string[]>
  formError?: string
}

export async function updateCompanySettingsAction(
  _prevState: SettingsFormState | undefined,
  formData: FormData
): Promise<SettingsFormState> {
  await verifySession()

  const parsed = companySettingsSchema.safeParse({
    companyName: formData.get("companyName"),
    logoUrl: formData.get("logoUrl"),
    currency: formData.get("currency"),
    vatPercentage: formData.get("vatPercentage"),
    vatNumber: formData.get("vatNumber"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  await updateCompanySettings({
    companyName: parsed.data.companyName,
    logoUrl: parsed.data.logoUrl,
    currency: parsed.data.currency,
    vatPercentage: Number(parsed.data.vatPercentage),
    vatNumber: parsed.data.vatNumber,
    address: parsed.data.address,
    phone: parsed.data.phone,
    email: parsed.data.email,
  })

  revalidatePath("/settings")
  return {}
}

export async function changePasswordAction(
  _prevState: SettingsFormState | undefined,
  formData: FormData
): Promise<SettingsFormState> {
  const { userId } = await verifySession()

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const user = await queryOne<{ password_hash: string }>(
    "SELECT password_hash FROM users WHERE id = $1",
    [userId]
  )

  if (!user) {
    return { formError: "User not found." }
  }

  const isValid = await verifyPassword(parsed.data.currentPassword, user.password_hash)
  if (!isValid) {
    return { fieldErrors: { currentPassword: ["Current password is incorrect."] } }
  }

  const newHash = await hashPassword(parsed.data.newPassword)
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId])

  return {}
}
