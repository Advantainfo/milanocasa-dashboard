"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FileSpreadsheet, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ReportType } from "@/lib/report-period"

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

interface ReportsToolbarProps {
  type: ReportType
  year: number
  month: number
  start: string
  end: string
}

export function ReportsToolbar({ type, year, month, start, end }: ReportsToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(next).forEach(([key, value]) => params.set(key, value))
    router.push(`${pathname}?${params.toString()}`)
  }

  const exportQuery = new URLSearchParams({
    type,
    year: String(year),
    month: String(month),
    start,
    end,
  }).toString()

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={type} onValueChange={(value) => pushParams({ type: value })}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>

        {type === "monthly" && (
          <>
            <Select
              value={String(month)}
              onValueChange={(value) => pushParams({ month: value })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((label, index) => (
                  <SelectItem key={label} value={String(index + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(year)}
              onValueChange={(value) => pushParams({ year: value })}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {type === "yearly" && (
          <Select
            value={String(year)}
            onValueChange={(value) => pushParams({ year: value })}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {type === "custom" && (
          <>
            <Input
              type="date"
              value={start}
              onChange={(event) => pushParams({ start: event.target.value })}
              className="w-[160px]"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="date"
              value={end}
              onChange={(event) => pushParams({ end: event.target.value })}
              className="w-[160px]"
            />
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <a href={`/api/reports/excel?${exportQuery}`} download>
            <FileSpreadsheet className="size-4" />
            Export Excel
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href={`/api/reports/pdf?${exportQuery}`} download>
            <FileText className="size-4" />
            Export PDF
          </a>
        </Button>
      </div>
    </div>
  )
}
