"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
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
import type { CustomerOption } from "@/server/repositories/customers.repo"
import { useDictionary } from "@/lib/i18n/dictionary-provider"

interface CustomerComboboxProps {
  customers: CustomerOption[]
  value: string
  onChange: (customerId: string) => void
  disabled?: boolean
}

export function CustomerCombobox({
  customers,
  value,
  onChange,
  disabled,
}: CustomerComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = customers.find((customer) => customer.id === value)
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
              ? selected.company
                ? `${selected.name} (${selected.company})`
                : selected.name
              : dict.orders.selectCustomer}
          </span>
          <ChevronsUpDown className="text-muted-foreground ml-2 size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder={dict.orders.searchCustomers} />
          <CommandList>
            <CommandEmpty>{dict.orders.noCustomerFound}</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={`${customer.name} ${customer.company ?? ""}`}
                  onSelect={() => {
                    onChange(customer.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      customer.id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    <p>{customer.name}</p>
                    {customer.company && (
                      <p className="text-muted-foreground text-xs">{customer.company}</p>
                    )}
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
