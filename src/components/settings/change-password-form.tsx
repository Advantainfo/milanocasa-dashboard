"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validation/settings"
import { changePasswordAction } from "@/server/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useDictionary } from "@/lib/i18n/dictionary-provider"

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const dict = useDictionary()

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function onSubmit(values: ChangePasswordInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("currentPassword", values.currentPassword)
      formData.set("newPassword", values.newPassword)
      formData.set("confirmPassword", values.confirmPassword)

      const result = await changePasswordAction(undefined, formData)

      if (result.formError) {
        toast.error(result.formError)
        return
      }
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof ChangePasswordInput, { message: messages[0] })
          }
        })
        return
      }

      toast.success(dict.settings.security.changed)
      form.reset()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{dict.settings.security.title}</CardTitle>
        <CardDescription>{dict.settings.security.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.settings.security.currentPassword}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.settings.security.newPassword}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.settings.security.confirmPassword}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? dict.common.saving : dict.settings.security.changePassword}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
