import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 mt-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando agendamentos...</span>
      <Skeleton className="h-[88px] w-full rounded-xl" />
      <Skeleton className="h-[88px] w-full rounded-xl" />
      <Skeleton className="h-[88px] w-full rounded-xl" />
      <Skeleton className="h-[88px] w-full rounded-xl" />
    </div>
  )
}
