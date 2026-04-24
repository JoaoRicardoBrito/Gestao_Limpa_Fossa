import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonTable() {
  return (
    <div className="space-y-2 mt-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando agendamentos...</span>
      <Skeleton className="h-10 w-full rounded" />
      <Skeleton className="h-10 w-full rounded" />
      <Skeleton className="h-10 w-full rounded" />
      <Skeleton className="h-10 w-full rounded" />
      <Skeleton className="h-10 w-full rounded" />
    </div>
  )
}
