"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteExpenseAction } from "@/server/actions/expenses"
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

interface DeleteExpenseDialogProps {
  expenseId: string
}

export function DeleteExpenseDialog({ expenseId }: DeleteExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dict = useDictionary()

  function handleDelete() {
    startTransition(async () => {
      await deleteExpenseAction(expenseId)
      toast.success(dict.expenses.deleted)
      setOpen(false)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${dict.common.delete} ${dict.expenses.title}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dict.expenses.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dict.expenses.deleteDescription}</AlertDialogDescription>
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
