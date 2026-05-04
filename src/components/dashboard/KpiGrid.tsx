import { CalendarDays, Clock, CheckCircle2, DollarSign, Timer, TrendingUp } from 'lucide-react'
import { KpiCard } from './KpiCard'
import type { KpiData, DashboardPeriod } from '@/hooks/useDashboard'

interface KpiGridProps {
  kpis: KpiData | null
  loading: boolean
  period: DashboardPeriod
}

function formatDuracao(minutos: number | null): string {
  if (minutos === null) return '—'
  if (minutos < 60) return `${minutos} min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatCurrency(value: number | null): string {
  if (value === null) return 'R$ —'
  return `R$ ${value.toLocaleString('pt-BR')}`
}

const PERIOD_SUFFIX: Record<DashboardPeriod, string> = {
  semana:   'na Semana',
  mes:      'no Mês',
  semestre: 'no Semestre',
}

export function KpiGrid({ kpis, loading, period }: KpiGridProps) {
  const suffix = PERIOD_SUFFIX[period]
  const ticket = kpis?.ticketMedio != null ? `R$ ${kpis.ticketMedio}` : 'R$ —'

  return (
    <div className="grid grid-cols-2 gap-4">
      <KpiCard
        label={`Total ${suffix}`}
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
        label={`Concluídos ${suffix}`}
        value={loading ? '' : String(kpis?.concluidosMes ?? 0)}
        icon={CheckCircle2}
        iconBg="bg-green-50"
        iconColor="text-green-600"
        loading={loading}
      />
      <KpiCard
        label="Ticket Médio"
        value={loading ? '' : ticket}
        icon={DollarSign}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        loading={loading}
      />
      <KpiCard
        label={`Faturamento ${suffix}`}
        value={loading ? '' : formatCurrency(kpis?.faturamentoTotal ?? null)}
        icon={TrendingUp}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        loading={loading}
      />
      <div className="col-span-1">
        <KpiCard
          label="Duração Média"
          value={loading ? '' : formatDuracao(kpis?.duracaoMedia ?? null)}
          icon={Timer}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          loading={loading}
        />
      </div>
    </div>
  )
}
