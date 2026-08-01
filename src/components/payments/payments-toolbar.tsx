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
import { PAYMENT_METHODS } from "@/types/database"
import type { OrderOption } from "@/server/repositories/orders.repo"
import { PaymentFormDialog } from "@/components/payments/payment-form-dialog"
import { useDictionary } from "@/lib/i18n/dictionary-provider"

interface PaymentsToolbarProps {
  defaultSearch: string
  defaultMethod: string
  orders: OrderOption[]
}

const ALL_METHODS_VALUE = "all"

export function PaymentsToolbar({
  defaultSearch,
  defaultMethod,
  orders,
}: PaymentsToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dict = useDictionary()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== ALL_METHODS_VALUE) {
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
          placeholder={dict.payments.searchPlaceholder}
          onSearch={(value) => updateParam("search", value)}
        />
        <Select
          value={defaultMethod || ALL_METHODS_VALUE}
          onValueChange={(value) => updateParam("method", value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={dict.payments.allMethods} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_METHODS_VALUE}>{dict.payments.allMethods}</SelectItem>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {dict.statuses.paymentMethod[method]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <PaymentFormDialog mode="create" orders={orders} />
    </div>
  )
}
