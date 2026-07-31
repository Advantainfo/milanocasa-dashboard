import { z } from "zod"
import { PAYMENT_METHODS } from "@/types/database"

export const paymentFieldsSchema = z.object({
  orderId: z.string().trim().min(1, { error: "Select an order." }),
  amount: z
    .string()
    .trim()
    .refine(
      (value) => value !== "" && !Number.isNaN(Number(value)) && Number(value) > 0,
      {
        error: "Amount must be greater than zero.",
      }
    ),
  paymentDate: z.string().trim().min(1, { error: "Select a date." }),
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().max(200),
  notes: z.string().trim().max(2000),
})

export type PaymentFieldsInput = z.infer<typeof paymentFieldsSchema>
