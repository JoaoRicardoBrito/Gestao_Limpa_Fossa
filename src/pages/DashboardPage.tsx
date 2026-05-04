import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/hooks/useDashboard'
import type { DashboardPeriod } from '@/hooks/useDashboard'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { BarChartCard } from '@/components/dashboard/BarChartCard'
import { DonutChartCard } from '@/components/dashboard/DonutChartCard'
import { RankingChartCard } from '@/components/dashboard/RankingChartCard'

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'semana',   label: 'Semana' },
  { value: 'mes',      label: 'Mês' },
  { value: 'semestre', label: 'Semestre' },
]

const BAR_TITLE: Record<DashboardPeriod, string> = {
  semana:   'Agendamentos por Dia',
  mes:      'Agendamentos por Mês (6 meses)',
  semestre: 'Agendamentos por Mês (6 meses)',
}

export function DashboardPage() {
  const {
    period, setPeriod,
    kpis, barData, donutData, motoristaData, caminhaoData,
    isLoading, error,
  } = useDashboard()

  if (!isLoading && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <AlertCircle className="h-8 w-8 text-zinc-400" aria-hidden="true" />
        <p className="text-sm font-semibold text-zinc-900">Erro ao carregar o dashboard</p>
        <p className="text-sm text-zinc-500">Não foi possível buscar os dados. Recarregue a página.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 xl:p-8 space-y-6">
      {/* Header + período filter */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
        <div className="flex gap-1 bg-zinc-100 rounded-lg p-1">
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={[
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                period === value
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <KpiGrid kpis={kpis} loading={isLoading} period={period} />

      {/* Bar + Donut */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BarChartCard data={barData} loading={isLoading} title={BAR_TITLE[period]} />
        <DonutChartCard data={donutData} loading={isLoading} />
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RankingChartCard
          title="Motoristas com mais serviços"
          data={motoristaData}
          loading={isLoading}
          emptyMessage="Nenhum serviço concluído no período"
        />
        <RankingChartCard
          title="Caminhões mais utilizados"
          data={caminhaoData}
          loading={isLoading}
          emptyMessage="Nenhum serviço concluído no período"
        />
      </div>
    </div>
  )
}
