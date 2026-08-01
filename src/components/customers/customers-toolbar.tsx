"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchInput } from "@/components/shared/search-input"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"
import { useDictionary } from "@/lib/i18n/dictionary-provider"

export function CustomersToolbar({ defaultSearch }: { defaultSearch: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dict = useDictionary()

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <SearchInput
        defaultValue={defaultSearch}
        placeholder={dict.customers.searchPlaceholder}
        onSearch={handleSearch}
      />
      <CustomerFormDialog mode="create" />
    </div>
  )
}
