"use client"

import { useState, useTransition, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { orderCreateSchema, type OrderCreateInput } from "@/lib/validation/orders"
import { createOrderAction, updateOrderAction } from "@/server/actions/orders"
import { ORDER_STATUSES, PAYMENT_METHODS, type OrderStatus } from "@/types/database"
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants"
import type { CustomerOption } from "@/server/repositories/customers.repo"
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
import { CustomerCombobox } from "@/components/orders/customer-combobox"

export interface OrderEditableRecord {
  id: string
  customerId: string
  furnitureDescription: string
  quantity: number
  salePrice: string
  deliveryDate: string | null
  status: OrderStatus
  notes: string | null
}

interface OrderFormDialogProps {
  mode: "create" | "edit"
  customers: CustomerOption[]
  order?: OrderEditableRecord
  trigger?: ReactNode
}

interface ActionResult {
  fieldErrors?: Record<string, string[]>
  formError?: string
}

export function OrderFormDialog({
  mode,
  customers,
  order,
  trigger,
}: OrderFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<OrderCreateInput>({
    resolver: zodResolver(orderCreateSchema),
    defaultValues: {
      customerId: order?.customerId ?? "",
      furnitureDescription: order?.furnitureDescription ?? "",
      quantity: order ? String(order.quantity) : "1",
      salePrice: order?.salePrice ?? "",
      deliveryDate: order?.deliveryDate ?? "",
      status: order?.status ?? "new",
      notes: order?.notes ?? "",
      depositAmount: "0",
      depositMethod: undefined,
    },
  })

  const depositAmount = form.watch("depositAmount")
  const showDepositMethod = mode === "create" && Number(depositAmount) > 0

  function handleResult(result: ActionResult) {
    if (result.formError) {
      toast.error(result.formError)
      return
    }
    if (result.fieldErrors) {
      Object.entries(result.fieldErrors).forEach(([field, messages]) => {
        if (messages?.[0]) {
          form.setError(field as keyof OrderCreateInput, { message: messages[0] })
        }
      })
      return
    }
    toast.success(mode === "edit" ? "Order updated." : "Order created.")
    setOpen(false)
    form.reset()
  }

  function onSubmit(values: OrderCreateInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("customerId", values.customerId)
      formData.set("furnitureDescription", values.furnitureDescription)
      formData.set("quantity", values.quantity)
      formData.set("salePrice", values.salePrice)
      formData.set("deliveryDate", values.deliveryDate)
      formData.set("status", values.status)
      formData.set("notes", values.notes)

      if (mode === "create") {
        formData.set("depositAmount", values.depositAmount)
        if (values.depositMethod) formData.set("depositMethod", values.depositMethod)
        handleResult(await createOrderAction(undefined, formData))
        return
      }

      if (order) formData.set("id", order.id)
      handleResult(await updateOrderAction(undefined, formData))
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
            Add order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit order" : "New order"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this order's details."
              : "Create a new order for a customer."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <CustomerCombobox
                      customers={customers}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="furnitureDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Furniture</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Oak dining table, 6 chairs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale price (€)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery date</FormLabel>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode === "create" && (
              <div className="grid grid-cols-1 gap-4 rounded-lg border p-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit (€)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {showDepositMethod && (
                  <FormField
                    control={form.control}
                    name="depositMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deposit method</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select method" />
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
                )}
              </div>
            )}
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
                    : "Create order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
