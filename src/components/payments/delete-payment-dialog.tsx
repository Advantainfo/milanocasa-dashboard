"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deletePaymentAction } from "@/server/actions/payments"
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

interface DeletePaymentDialogProps {
  paymentId: string
  orderId: string
  orderNumber: string
}

export function DeletePaymentDialog({
  paymentId,
  orderId,
  orderNumber,
}: DeletePaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dict = useDictionary()

  function handleDelete() {
    startTransition(async () => {
      await deletePaymentAction(paymentId, orderId)
      toast.success(dict.payments.deleted)
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
            name: orderNumber,
          })}
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dict.payments.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {formatMessage(dict.payments.deleteDescription, { orderNumber })}
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
