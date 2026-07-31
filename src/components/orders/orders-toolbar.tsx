"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchInput } from "@/components/shared/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ORDER_STATUS_LABELS } from "@/lib/constants"
import { ORDER_STATUSES } from "@/types/database"
import type { CustomerOption } from "@/server/repositories/customers.repo"
import { OrderFormDialog } from "@/components/orders/order-form-dialog"

interface OrdersToolbarProps {
  defaultSearch: string
  defaultStatus: string
  customers: CustomerOption[]
}

const ALL_STATUSES_VALUE = "all"

export function OrdersToolbar({
  defaultSearch,
  defaultStatus,
  customers,
}: OrdersToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== ALL_STATUSES_VALUE) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          defaultValue={defaultSearch}
          placeholder="Search orders…"
          onSearch={(value) => updateParam("search", value)}
        />
        <Select
          value={defaultStatus || ALL_STATUSES_VALUE}
          onValueChange={(value) => updateParam("status", value)}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES_VALUE}>All statuses</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <OrderFormDialog mode="create" customers={customers} />
    </div>
  )
}
