"use client"

import { useState, useTransition, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { orderCreateSchema, type OrderCreateInput } from "@/lib/validation/orders"
import { createOrderAction, updateOrderAction } from "@/server/actions/orders"
import {
  ORDER_JOB_TYPES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  type OrderJobType,
  type OrderStatus,
} from "@/types/database"
import { formatCurrency } from "@/lib/format"
import type { CustomerOption } from "@/server/repositories/customers.repo"
import { useDictionary } from "@/lib/i18n/dictionary-provider"
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
  jobType: OrderJobType
  materialCost: string
  labourCost: string
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
  const dict = useDictionary()

  const form = useForm<OrderCreateInput>({
    resolver: zodResolver(orderCreateSchema),
    defaultValues: {
      customerId: order?.customerId ?? "",
      furnitureDescription: order?.furnitureDescription ?? "",
      quantity: order ? String(order.quantity) : "1",
      salePrice: order?.salePrice ?? "",
      deliveryDate: order?.deliveryDate ?? "",
      status: order?.status ?? "new",
      jobType: order?.jobType ?? "personal_sale",
      materialCost: order?.materialCost ?? "0",
      labourCost: order?.labourCost ?? "0",
      notes: order?.notes ?? "",
      depositAmount: "0",
      depositMethod: undefined,
    },
  })

  const depositAmount = form.watch("depositAmount")
  const showDepositMethod = mode === "create" && Number(depositAmount) > 0

  const salePrice = form.watch("salePrice")
  const materialCost = form.watch("materialCost")
  const labourCost = form.watch("labourCost")
  const expectedProfitPreview =
    (Number(salePrice) || 0) - (Number(materialCost) || 0) - (Number(labourCost) || 0)

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
    toast.success(mode === "edit" ? dict.orders.updated : dict.orders.created)
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
      formData.set("jobType", values.jobType)
      formData.set("materialCost", values.materialCost)
      formData.set("labourCost", values.labourCost)
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
            {dict.orders.addOrder}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? dict.orders.editOrder : dict.orders.newOrder}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? dict.orders.editDescription : dict.orders.addDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.orders.customer}</FormLabel>
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
                  <FormLabel>{dict.orders.furniture}</FormLabel>
                  <FormControl>
                    <Input placeholder={dict.orders.furniturePlaceholder} {...field} />
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
                    <FormLabel>{dict.orders.quantity}</FormLabel>
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
                    <FormLabel>{dict.orders.salePrice}</FormLabel>
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
                    <FormLabel>{dict.orders.deliveryDate}</FormLabel>
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
                  <FormLabel>{dict.common.status}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {dict.statuses.order[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4 rounded-lg border p-3">
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.orders.jobType}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ORDER_JOB_TYPES.map((jobType) => (
                          <SelectItem key={jobType} value={jobType}>
                            {dict.orders.jobTypeOptions[jobType]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="materialCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dict.orders.materialCost}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="labourCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dict.orders.labourCost}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{dict.orders.expectedProfit}</span>
                <span
                  className={
                    expectedProfitPreview < 0 ? "text-warning font-medium" : "font-medium"
                  }
                >
                  {formatCurrency(expectedProfitPreview)}
                </span>
              </div>
            </div>
            {mode === "create" && (
              <div className="grid grid-cols-1 gap-4 rounded-lg border p-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dict.orders.deposit}</FormLabel>
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
                        <FormLabel>{dict.orders.depositMethod}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={dict.orders.selectMethod} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem key={method} value={method}>
                                {dict.statuses.paymentMethod[method]}
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
                  <FormLabel>{dict.common.notes}</FormLabel>
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
                  ? dict.common.saving
                  : mode === "edit"
                    ? dict.common.saveChanges
                    : dict.orders.createOrder}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
