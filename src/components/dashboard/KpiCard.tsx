import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string       // pre-formatted: "24", "R$ 450", "R$ —"
  icon: LucideIcon
  iconBg: string      // e.g. "bg-blue-50"
  iconColor: string   // e.g. "text-blue-600"
  loading?: boolean
}

export function KpiCard({ label, value, icon: Icon, iconBg, iconColor, loading }: KpiCardProps) {
  return (
    <Card className="bg-white border border-zinc-200 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              {label}
            </span>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span
                className="text-3xl font-semibold text-zinc-900"
                aria-label={`${label}: ${value}`}
              >
                {value}
              </span>
            )}
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
