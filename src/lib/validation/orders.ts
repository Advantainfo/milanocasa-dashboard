import { z } from "zod"
import { ORDER_JOB_TYPES, ORDER_STATUSES, PAYMENT_METHODS } from "@/types/database"

function isNonNegativeNumber(value: string) {
  return value !== "" && !Number.isNaN(Number(value)) && Number(value) >= 0
}

export const orderFieldsSchema = z.object({
  customerId: z.string().trim().min(1, { error: "Select a customer." }),
  furnitureDescription: z
    .string()
    .trim()
    .min(1, { error: "Describe the furniture." })
    .max(500),
  quantity: z
    .string()
    .trim()
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, {
      error: "Quantity must be a whole number of at least 1.",
    }),
  salePrice: z.string().trim().refine(isNonNegativeNumber, {
    error: "Sale price must be zero or more.",
  }),
  deliveryDate: z.string().trim(),
  status: z.enum(ORDER_STATUSES),
  jobType: z.enum(ORDER_JOB_TYPES),
  materialCost: z.string().trim().refine(isNonNegativeNumber, {
    error: "Material cost must be zero or more.",
  }),
  labourCost: z.string().trim().refine(isNonNegativeNumber, {
    error: "Labour cost must be zero or more.",
  }),
  notes: z.string().trim().max(2000),
})

export type OrderFieldsInput = z.infer<typeof orderFieldsSchema>

export const orderCreateSchema = orderFieldsSchema
  .extend({
    depositAmount: z.string().trim().refine(isNonNegativeNumber, {
      error: "Deposit must be zero or more.",
    }),
    depositMethod: z.enum(PAYMENT_METHODS).optional(),
  })
  .refine((data) => Number(data.depositAmount) === 0 || Boolean(data.depositMethod), {
    error: "Select a payment method for the deposit.",
    path: ["depositMethod"],
  })

export type OrderCreateInput = z.infer<typeof orderCreateSchema>
