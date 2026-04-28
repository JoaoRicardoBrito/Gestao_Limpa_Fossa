import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DonutDataPoint } from '@/hooks/useDashboard'

interface DonutChartCardProps {
  data: DonutDataPoint[]
  loading?: boolean
}

// Ordered palette from UI-SPEC — max 8 service types (cycles if more)
const DONUT_COLORS = [
  '#2563eb', // blue-600
  '#16a34a', // green-600
  '#7c3aed', // violet-600
  '#f97316', // orange-500
  '#0d9488', // teal-600
  '#e11d48', // rose-600
  '#d97706', // amber-600
  '#4f46e5', // indigo-600
]

// Custom tooltip — HTML only (not SVG)
function CustomDonutTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-md px-3 py-2 text-xs text-zinc-900">
      {payload[0].name} — {payload[0].value} agendamentos
    </div>
  )
}

// Custom HTML legend — NOT using Recharts <Legend> component
// Percentages computed from slice.value / total
function DonutLegend({ data }: { data: DonutDataPoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null
  return (
    <div className="flex flex-col gap-2 mt-3">
      {data.map((entry, i) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs text-zinc-700">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: DONUT_COLORS[i % 8] }}
          />
          {entry.name} — {Math.round((entry.value / total) * 100)}%
        </div>
      ))}
    </div>
  )
}

export function DonutChartCard({ data, loading }: DonutChartCardProps) {
  return (
    <Card className="bg-white border border-zinc-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-900">
          Distribuição por Serviço
        </CardTitle>
        <p className="text-xs text-zinc-500">Todos os agendamentos</p>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="w-full h-[240px] rounded-lg" />
        ) : data.length === 0 ? (
          // Empty state guard — PieChart crashes or renders nothing on empty array
          <div className="flex items-center justify-center h-[240px]">
            <p className="text-sm text-zinc-400">Nenhum serviço registrado ainda.</p>
          </div>
        ) : (
          <div aria-label="Gráfico de rosca: distribuição de agendamentos por tipo de serviço">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % 8]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomDonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <DonutLegend data={data} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
