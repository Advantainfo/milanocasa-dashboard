"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { OrderOption } from "@/server/repositories/orders.repo"
import { useDictionary } from "@/lib/i18n/dictionary-provider"

interface OrderComboboxProps {
  orders: OrderOption[]
  value: string
  onChange: (orderId: string) => void
  disabled?: boolean
}

export function OrderCombobox({ orders, value, onChange, disabled }: OrderComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = orders.find((order) => order.id === value)
  const dict = useDictionary()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected
              ? `${selected.orderNumber} — ${selected.customerName}`
              : dict.payments.selectOrder}
          </span>
          <ChevronsUpDown className="text-muted-foreground ml-2 size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder={dict.payments.searchOrders} />
          <CommandList>
            <CommandEmpty>{dict.payments.noOrderFound}</CommandEmpty>
            <CommandGroup>
              {orders.map((order) => (
                <CommandItem
                  key={order.id}
                  value={`${order.orderNumber} ${order.customerName}`}
                  onSelect={() => {
                    onChange(order.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      order.id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <div>
                      <p>{order.orderNumber}</p>
                      <p className="text-muted-foreground text-xs">
                        {order.customerName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-xs whitespace-nowrap",
                        Number(order.remainingBalance) > 0
                          ? "text-amber-600 dark:text-amber-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {Number(order.remainingBalance) > 0
                        ? `${formatCurrency(order.remainingBalance)} ${dict.payments.due}`
                        : dict.payments.paid}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
