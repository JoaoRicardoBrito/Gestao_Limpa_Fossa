import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { RankingDataPoint } from '@/hooks/useDashboard'

interface RankingChartCardProps {
  title: string
  data: RankingDataPoint[]
  loading: boolean
  emptyMessage?: string
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc']

export function RankingChartCard({ title, data, loading, emptyMessage = 'Sem dados no período' }: RankingChartCardProps) {
  return (
    <Card className="bg-white border border-zinc-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-zinc-400">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                interval={0}
                width={80}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number) => [value, 'Serviços']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }}
                cursor={{ fill: '#f4f4f5' }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
