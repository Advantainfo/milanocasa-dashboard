import { z } from "zod"

export const companySettingsSchema = z.object({
  companyName: z.string().trim().min(1, { error: "Company name is required." }).max(200),
  logoUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || z.url().safeParse(value).success, {
      error: "Enter a valid URL.",
    }),
  currency: z.enum(["EUR", "USD", "GBP"]),
  vatPercentage: z
    .string()
    .trim()
    .refine(
      (value) =>
        value !== "" &&
        !Number.isNaN(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) <= 100,
      { error: "VAT % must be between 0 and 100." }
    ),
  vatNumber: z.string().trim().max(50),
  address: z.string().trim().max(300),
  phone: z.string().trim().max(50),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      error: "Enter a valid email address.",
    }),
})

export type CompanySettingsFieldsInput = z.infer<typeof companySettingsSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Enter your current password." }),
    newPassword: z
      .string()
      .min(8, { error: "New password must be at least 8 characters." }),
    confirmPassword: z.string().min(1, { error: "Confirm your new password." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
