"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  companySettingsSchema,
  type CompanySettingsFieldsInput,
} from "@/lib/validation/settings"
import { updateCompanySettingsAction } from "@/server/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { CompanySettings } from "@/server/repositories/settings.repo"
import { useDictionary } from "@/lib/i18n/dictionary-provider"

export function CompanySettingsForm({ settings }: { settings: CompanySettings }) {
  const [isPending, startTransition] = useTransition()
  const dict = useDictionary()

  const form = useForm<CompanySettingsFieldsInput>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      companyName: settings.companyName,
      logoUrl: settings.logoUrl ?? "",
      currency: settings.currency as "EUR" | "USD" | "GBP",
      vatPercentage: settings.vatPercentage,
      vatNumber: settings.vatNumber ?? "",
      address: settings.address ?? "",
      phone: settings.phone ?? "",
      email: settings.email ?? "",
    },
  })

  const logoUrl = form.watch("logoUrl")

  function onSubmit(values: CompanySettingsFieldsInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("companyName", values.companyName)
      formData.set("logoUrl", values.logoUrl)
      formData.set("currency", values.currency)
      formData.set("vatPercentage", values.vatPercentage)
      formData.set("vatNumber", values.vatNumber)
      formData.set("address", values.address)
      formData.set("phone", values.phone)
      formData.set("email", values.email)

      const result = await updateCompanySettingsAction(undefined, formData)

      if (result.formError) {
        toast.error(result.formError)
        return
      }
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof CompanySettingsFieldsInput, {
              message: messages[0],
            })
          }
        })
        return
      }

      toast.success(dict.settings.company.saved)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{dict.settings.company.title}</CardTitle>
        <CardDescription>{dict.settings.company.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.settings.company.companyName}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.settings.company.logoUrl}</FormLabel>
                  <div className="flex items-center gap-3">
                    {logoUrl && (
                      // Arbitrary user-provided URL - next/image requires allow-listing
                      // remote hosts ahead of time, which isn't possible here.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt="Company logo preview"
                        className="size-10 shrink-0 rounded-md border object-contain"
                        onError={(event) => {
                          event.currentTarget.style.visibility = "hidden"
                        }}
                      />
                    )}
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        className="flex-1"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.settings.company.currency}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.settings.company.vatPercentage}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.settings.company.vatNumber}</FormLabel>
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
                <FormItem>
                  <FormLabel>{dict.settings.company.address}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.settings.company.phone}</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
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
                    <FormLabel>{dict.settings.company.email}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? dict.common.saving : dict.common.saveChanges}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
