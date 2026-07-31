"use client"

import { useState, useTransition, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { expenseFieldsSchema, type ExpenseFieldsInput } from "@/lib/validation/expenses"
import { createExpenseAction, updateExpenseAction } from "@/server/actions/expenses"
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/database"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export interface ExpenseEditableRecord {
  id: string
  category: ExpenseCategory
  supplier: string | null
  amount: string
  invoiceNumber: string | null
  expenseDate: string
  notes: string | null
}

interface ExpenseFormDialogProps {
  mode: "create" | "edit"
  expense?: ExpenseEditableRecord
  trigger?: ReactNode
}

export function ExpenseFormDialog({ mode, expense, trigger }: ExpenseFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ExpenseFieldsInput>({
    resolver: zodResolver(expenseFieldsSchema),
    defaultValues: {
      category: expense?.category ?? "materials",
      supplier: expense?.supplier ?? "",
      amount: expense?.amount ?? "",
      invoiceNumber: expense?.invoiceNumber ?? "",
      expenseDate: expense?.expenseDate ?? new Date().toISOString().slice(0, 10),
      notes: expense?.notes ?? "",
    },
  })

  function onSubmit(values: ExpenseFieldsInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("category", values.category)
      formData.set("supplier", values.supplier)
      formData.set("amount", values.amount)
      formData.set("invoiceNumber", values.invoiceNumber)
      formData.set("expenseDate", values.expenseDate)
      formData.set("notes", values.notes)
      if (mode === "edit" && expense) formData.set("id", expense.id)

      const action = mode === "edit" ? updateExpenseAction : createExpenseAction
      const result = await action(undefined, formData)

      if (result.formError) {
        toast.error(result.formError)
        return
      }
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof ExpenseFieldsInput, { message: messages[0] })
          }
        })
        return
      }

      toast.success(mode === "edit" ? "Expense updated." : "Expense added.")
      setOpen(false)
      form.reset()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) form.reset()
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" />
            Add expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this expense's details."
              : "Log a new business expense."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {EXPENSE_CATEGORY_LABELS[category]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (€)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : mode === "edit" ? "Save changes" : "Add expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
