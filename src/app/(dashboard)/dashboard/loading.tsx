import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-24 w-full rounded-xl" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[380px] w-full rounded-xl lg:col-span-2" />
        <div className="grid gap-4">
          <Skeleton className="h-[220px] w-full rounded-xl" />
          <Skeleton className="h-[220px] w-full rounded-xl" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[380px] w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-[380px] w-full rounded-xl" />
      </div>
    </div>
  )
}
