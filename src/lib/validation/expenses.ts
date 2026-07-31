import { z } from "zod"
import { EXPENSE_CATEGORIES } from "@/types/database"

export const expenseFieldsSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  supplier: z.string().trim().max(200),
  amount: z
    .string()
    .trim()
    .refine(
      (value) => value !== "" && !Number.isNaN(Number(value)) && Number(value) > 0,
      {
        error: "Amount must be greater than zero.",
      }
    ),
  invoiceNumber: z.string().trim().max(100),
  expenseDate: z.string().trim().min(1, { error: "Select a date." }),
  notes: z.string().trim().max(2000),
})

export type ExpenseFieldsInput = z.infer<typeof expenseFieldsSchema>
