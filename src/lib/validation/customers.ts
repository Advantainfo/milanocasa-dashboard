import { z } from "zod"

export const customerSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }).max(200),
  company: z.string().trim().max(200),
  vatNumber: z.string().trim().max(50),
  address: z.string().trim().max(500),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      error: "Enter a valid email address.",
    }),
  phone: z.string().trim().max(50),
  notes: z.string().trim().max(2000),
})

export type CustomerInput = z.infer<typeof customerSchema>
