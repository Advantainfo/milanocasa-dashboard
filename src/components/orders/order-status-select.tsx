"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { updateOrderStatusAction } from "@/server/actions/orders"
import { ORDER_STATUSES, type OrderStatus } from "@/types/database"
import { ORDER_STATUS_LABELS } from "@/lib/constants"
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

  function handleChange(nextStatus: string) {
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, nextStatus)
        toast.success("Status updated.")
      } catch {
        toast.error("Couldn't update status.")
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
            {ORDER_STATUS_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
