"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDictionary } from "@/lib/i18n/dictionary-provider"
import { formatMessage } from "@/lib/i18n/format-message"

interface PaginationProps {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: PaginationProps) {
  const dict = useDictionary()
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <p className="text-muted-foreground text-sm">
        {totalCount === 0
          ? dict.common.noResults
          : formatMessage(dict.common.showingRange, { start, end, total: totalCount })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          {dict.common.previous}
        </Button>
        <span className="text-muted-foreground text-sm">
          {formatMessage(dict.common.pageOf, { page, total: totalPages })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {dict.common.next}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
