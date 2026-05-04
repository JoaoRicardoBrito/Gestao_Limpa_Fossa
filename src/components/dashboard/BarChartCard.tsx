import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { BarDataPoint } from '@/hooks/useDashboard'

interface BarChartCardProps {
  data: BarDataPoint[]
  loading?: boolean
  title?: string
}

// Custom tooltip — MUST return HTML (not SVG). v3 type: plain props object
function CustomBarTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-md px-3 py-2 text-xs text-zinc-900">
      {label} — {payload[0].value} agendamentos
    </div>
  )
}

export function BarChartCard({ data, loading, title = 'Agendamentos por Mês' }: BarChartCardProps) {
  return (
    <Card className="bg-white border border-zinc-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-900">
          {title}
        </CardTitle>
        <p className="text-xs text-zinc-500">Últimos 6 meses</p>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="w-full h-[280px] rounded-lg" />
        ) : (
          <div aria-label="Gráfico de barras: agendamentos por mês nos últimos 6 meses">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} allowDecimals={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="total"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  activeBar={{ fill: '#1d4ed8' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
