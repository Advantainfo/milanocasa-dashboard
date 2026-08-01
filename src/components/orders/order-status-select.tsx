"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { updateOrderStatusAction } from "@/server/actions/orders"
import { ORDER_STATUSES, type OrderStatus } from "@/types/database"
import { useDictionary } from "@/lib/i18n/dictionary-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrderStatusSelectProps {
  orderId: string
  status: OrderStatus
}

export function OrderStatusSelect({ orderId, status }: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition()
  const dict = useDictionary()

  function handleChange(nextStatus: string) {
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, nextStatus)
        toast.success(dict.orders.statusUpdated)
      } catch {
        toast.error(dict.orders.statusUpdateFailed)
      }
    })
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger size="sm" className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((value) => (
          <SelectItem key={value} value={value}>
            {dict.statuses.order[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
