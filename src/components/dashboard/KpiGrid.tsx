import { CalendarDays, Clock, CheckCircle2, DollarSign } from 'lucide-react'
import { KpiCard } from './KpiCard'
import type { KpiData } from '@/hooks/useDashboard'

interface KpiGridProps {
  kpis: KpiData | null
  loading: boolean
}

export function KpiGrid({ kpis, loading }: KpiGridProps) {
  // Format ticket médio: "R$ {value}" or "R$ —" when null
  const ticketValue = kpis?.ticketMedio !== null && kpis?.ticketMedio !== undefined
    ? `R$ ${kpis.ticketMedio}`
    : 'R$ —'

  return (
    <div className="grid grid-cols-2 gap-4">
      <KpiCard
        label="Total do Mês"
        value={loading ? '' : String(kpis?.totalMes ?? 0)}
        icon={CalendarDays}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        loading={loading}
      />
      <KpiCard
        label="Pendentes Agora"
        value={loading ? '' : String(kpis?.pendentesAgora ?? 0)}
        icon={Clock}
        iconBg="bg-yellow-50"
        iconColor="text-yellow-600"
        loading={loading}
      />
      <KpiCard
        label="Concluídos no Mês"
        value={loading ? '' : String(kpis?.concluidosMes ?? 0)}
        icon={CheckCircle2}
        iconBg="bg-green-50"
        iconColor="text-green-600"
        loading={loading}
      />
      <KpiCard
        label="Ticket Médio"
        value={loading ? '' : ticketValue}
        icon={DollarSign}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        loading={loading}
      />
    </div>
  )
}
