import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/hooks/useDashboard'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { BarChartCard } from '@/components/dashboard/BarChartCard'
import { DonutChartCard } from '@/components/dashboard/DonutChartCard'

export function DashboardPage() {
  const { kpis, barData, donutData, isLoading, error } = useDashboard()

  // Full-page error state — replaces all content when fetch fails
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
    <div>
      {/* Page header */}
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">Dashboard</h1>

      {/* KPI cards — 2×2 grid, stays 2-col at all breakpoints */}
      <div className="mb-6">
        <KpiGrid kpis={kpis} loading={isLoading} />
      </div>

      {/* Charts row — side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BarChartCard data={barData} loading={isLoading} />
        <DonutChartCard data={donutData} loading={isLoading} />
      </div>
    </div>
  )
}
