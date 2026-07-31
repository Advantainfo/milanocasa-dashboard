import type { Metadata } from "next"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import {
  listCustomers,
  type CustomerSortColumn,
} from "@/server/repositories/customers.repo"
import { CustomersTable } from "@/components/customers/customers-table"
import { CustomersToolbar } from "@/components/customers/customers-toolbar"

export const metadata: Metadata = { title: "Customers | Milano Casa" }

const SORT_COLUMNS: CustomerSortColumn[] = [
  "name",
  "totalOrders",
  "totalRevenue",
  "outstandingBalance",
  "createdAt",
]

interface CustomersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search : ""
  const page = Math.max(1, Number(params.page) || 1)
  const sortByParam = typeof params.sortBy === "string" ? params.sortBy : "name"
  const sortBy = SORT_COLUMNS.includes(sortByParam as CustomerSortColumn)
    ? (sortByParam as CustomerSortColumn)
    : "name"
  const sortDir = params.sortDir === "desc" ? "desc" : "asc"

  const { items, totalCount } = await listCustomers({
    search,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy,
    sortDir,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Customers</h2>
        <p className="text-muted-foreground text-sm">
          Manage your customer relationships and track their activity.
        </p>
      </div>
      <CustomersToolbar defaultSearch={search} />
      <CustomersTable
        items={items}
        totalCount={totalCount}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        sortBy={sortBy}
        sortDir={sortDir}
      />
    </div>
  )
}
