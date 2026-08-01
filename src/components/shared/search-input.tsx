"use client"

import { Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { useDictionary } from "@/lib/i18n/dictionary-provider"

interface SearchInputProps {
  defaultValue?: string
  placeholder?: string
  onSearch: (value: string) => void
  debounceMs?: number
}

export function SearchInput({
  defaultValue = "",
  placeholder,
  onSearch,
  debounceMs = 300,
}: SearchInputProps) {
  const dict = useDictionary()
  const [value, setValue] = useState(defaultValue)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const timeout = setTimeout(() => onSearch(value), debounceMs)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, debounceMs])

  return (
    <div className="relative w-full max-w-sm">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder ?? dict.common.search}
        className="pl-9"
      />
    </div>
  )
}
