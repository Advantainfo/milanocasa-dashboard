"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteCustomerAction } from "@/server/actions/customers"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useDictionary } from "@/lib/i18n/dictionary-provider"
import { formatMessage } from "@/lib/i18n/format-message"

interface DeleteCustomerDialogProps {
  customerId: string
  customerName: string
}

export function DeleteCustomerDialog({
  customerId,
  customerName,
}: DeleteCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dict = useDictionary()

  function handleDelete() {
    startTransition(async () => {
      await deleteCustomerAction(customerId)
      toast.success(formatMessage(dict.customers.deleted, { name: customerName }))
      setOpen(false)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={formatMessage(dict.common.actionOn, {
            action: dict.common.delete,
            name: customerName,
          })}
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {formatMessage(dict.customers.deleteTitle, { name: customerName })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {formatMessage(dict.customers.deleteDescription, { name: customerName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{dict.common.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? dict.common.deleting : dict.common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
