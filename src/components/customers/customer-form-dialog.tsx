"use client"

import { useState, useTransition, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { customerSchema, type CustomerInput } from "@/lib/validation/customers"
import { createCustomerAction, updateCustomerAction } from "@/server/actions/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { useDictionary } from "@/lib/i18n/dictionary-provider"

export interface CustomerEditableRecord {
  id: string
  name: string
  company: string | null
  vatNumber: string | null
  address: string | null
  email: string | null
  phone: string | null
  notes: string | null
}

interface CustomerFormDialogProps {
  mode: "create" | "edit"
  customer?: CustomerEditableRecord
  trigger?: ReactNode
}

export function CustomerFormDialog({ mode, customer, trigger }: CustomerFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dict = useDictionary()

  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      company: customer?.company ?? "",
      vatNumber: customer?.vatNumber ?? "",
      address: customer?.address ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      notes: customer?.notes ?? "",
    },
  })

  function onSubmit(values: CustomerInput) {
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.set(key, value)
      })
      if (mode === "edit" && customer) {
        formData.set("id", customer.id)
      }

      const action = mode === "edit" ? updateCustomerAction : createCustomerAction
      const result = await action(undefined, formData)

      if (result.formError) {
        toast.error(result.formError)
        return
      }

      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof CustomerInput, { message: messages[0] })
          }
        })
        return
      }

      toast.success(mode === "edit" ? dict.customers.updated : dict.customers.added)
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
            {dict.customers.addCustomer}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? dict.customers.editCustomer : dict.customers.addCustomer}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" ? dict.customers.editDescription : dict.customers.addDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{dict.customers.name}</FormLabel>
                    <FormControl>
                      <Input {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.customers.company}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dict.customers.vatNumber}{" "}
                      <span className="text-muted-foreground">({dict.common.optional})</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dict.customers.email}{" "}
                      <span className="text-muted-foreground">({dict.common.optional})</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.customers.phone}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{dict.customers.address}</FormLabel>
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
                  <FormItem className="col-span-2">
                    <FormLabel>{dict.common.notes}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? dict.common.saving
                  : mode === "edit"
                    ? dict.common.saveChanges
                    : dict.customers.addCustomer}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
