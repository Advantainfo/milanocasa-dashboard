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
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants"
import { EXPENSE_CATEGORIES } from "@/types/database"
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog"

interface ExpensesToolbarProps {
  defaultSearch: string
  defaultCategory: string
}

const ALL_CATEGORIES_VALUE = "all"

export function ExpensesToolbar({
  defaultSearch,
  defaultCategory,
}: ExpensesToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== ALL_CATEGORIES_VALUE) {
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
          placeholder="Search expenses…"
          onSearch={(value) => updateParam("search", value)}
        />
        <Select
          value={defaultCategory || ALL_CATEGORIES_VALUE}
          onValueChange={(value) => updateParam("category", value)}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_VALUE}>All categories</SelectItem>
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {EXPENSE_CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ExpenseFormDialog mode="create" />
    </div>
  )
}
