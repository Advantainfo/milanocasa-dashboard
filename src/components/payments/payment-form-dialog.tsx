"use client"

import { useState, useTransition, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { paymentFieldsSchema, type PaymentFieldsInput } from "@/lib/validation/payments"
import { createPaymentAction, updatePaymentAction } from "@/server/actions/payments"
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/database"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import type { OrderOption } from "@/server/repositories/orders.repo"
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
import { OrderCombobox } from "@/components/payments/order-combobox"

export interface PaymentEditableRecord {
  id: string
  orderId: string
  amount: string
  paymentDate: string
  method: PaymentMethod
  reference: string | null
  notes: string | null
}

interface PaymentFormDialogProps {
  mode: "create" | "edit"
  orders: OrderOption[]
  payment?: PaymentEditableRecord
  trigger?: ReactNode
}

export function PaymentFormDialog({
  mode,
  orders,
  payment,
  trigger,
}: PaymentFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<PaymentFieldsInput>({
    resolver: zodResolver(paymentFieldsSchema),
    defaultValues: {
      orderId: payment?.orderId ?? "",
      amount: payment?.amount ?? "",
      paymentDate: payment?.paymentDate ?? new Date().toISOString().slice(0, 10),
      method: payment?.method ?? "bank",
      reference: payment?.reference ?? "",
      notes: payment?.notes ?? "",
    },
  })

  function onSubmit(values: PaymentFieldsInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("orderId", values.orderId)
      formData.set("amount", values.amount)
      formData.set("paymentDate", values.paymentDate)
      formData.set("method", values.method)
      formData.set("reference", values.reference)
      formData.set("notes", values.notes)
      if (mode === "edit" && payment) formData.set("id", payment.id)

      const action = mode === "edit" ? updatePaymentAction : createPaymentAction
      const result = await action(undefined, formData)

      if (result.formError) {
        toast.error(result.formError)
        return
      }
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof PaymentFieldsInput, { message: messages[0] })
          }
        })
        return
      }

      toast.success(mode === "edit" ? "Payment updated." : "Payment recorded.")
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
            Record payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit payment" : "Record a payment"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this payment's details."
              : "Log a payment received against an order."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <OrderCombobox
                      orders={orders}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
                name="paymentDate"
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {PAYMENT_METHOD_LABELS[method]}
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
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. transfer ref." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                {isPending
                  ? "Saving…"
                  : mode === "edit"
                    ? "Save changes"
                    : "Record payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
