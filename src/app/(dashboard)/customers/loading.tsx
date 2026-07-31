import { Skeleton } from "@/components/ui/skeleton"

export default function CustomersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-3 rounded-xl border p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}
