import { useEffect, useState } from 'react'
import { getDashboardData } from '@/services/dashboard'
import type { Appointment } from '@/types'

// ─── Exported types ────────────────────────────────────────────────────────

export interface KpiData {
  totalMes: number
  pendentesAgora: number
  concluidosMes: number
  ticketMedio: number | null    // null → render "R$ —"
  duracaoMedia: number | null   // minutes, null → render "—"
}

export interface BarDataPoint {
  month: string   // e.g. "Abr/26"
  total: number
}

export interface DonutDataPoint {
  name: string    // servico value
  value: number   // count
}

export interface DashboardState {
  kpis: KpiData | null
  barData: BarDataPoint[]
  donutData: DonutDataPoint[]
  isLoading: boolean
  error: string | null
}

// ─── UTC-3 boundary helper ─────────────────────────────────────────────────
// MUST compute explicitly — Vercel runs in UTC, not UTC-3 (Teresina)
// Do NOT use new Date().toISOString() for month boundaries

export function getCurrentMonthRangeISO(): { start: string; end: string } {
  const now = new Date()
  // Shift to BRT by subtracting 3 hours to find the correct calendar month
  const brtNow = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  const year = brtNow.getUTCFullYear()
  const month = brtNow.getUTCMonth()
  // Midnight BRT = 03:00 UTC; last millisecond of month BRT = next-month 02:59:59.999 UTC
  const start = new Date(Date.UTC(year, month, 1, 3, 0, 0, 0))
  const end = new Date(Date.UTC(year, month + 1, 1, 2, 59, 59, 999))
  return { start: start.toISOString(), end: end.toISOString() }
}

// Portuguese month abbreviations — do NOT use date-fns format('MMM') which returns English
const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// ─── Pure aggregation helpers ──────────────────────────────────────────────

export function computeKpis(appointments: Appointment[]): KpiData {
  const { start, end } = getCurrentMonthRangeISO()

  // Total do Mês: all appointments with data_hora in current BRT month (all statuses)
  const totalMes = appointments.filter(a =>
    a.data_hora >= start && a.data_hora <= end
  ).length

  // Pendentes Agora: no date filter — total pending RIGHT NOW
  const pendentesAgora = appointments.filter(a => a.status === 'pendente').length

  // Concluídos no Mês: status=concluido AND concluido_em in current BRT month
  const concluidosMes = appointments.filter(a =>
    a.status === 'concluido' &&
    a.concluido_em !== null &&
    a.concluido_em >= start &&
    a.concluido_em <= end
  ).length

  // Ticket Médio: avg(valor) for concluido with valor NOT NULL and data_hora in current month
  const concluidosComValor = appointments.filter(a =>
    a.status === 'concluido' &&
    a.valor !== null &&
    a.data_hora >= start &&
    a.data_hora <= end
  )
  const ticketMedio = concluidosComValor.length > 0
    ? Math.round(
        concluidosComValor.reduce((sum, a) => sum + (a.valor ?? 0), 0) /
        concluidosComValor.length
      )
    : null

  // Duração Média: avg(concluido_em - em_andamento_em) in minutes for concluido in current month
  const concluidosComDuracao = appointments.filter(a =>
    a.status === 'concluido' &&
    a.em_andamento_em !== null &&
    a.concluido_em !== null &&
    a.concluido_em >= start &&
    a.concluido_em <= end
  )
  const duracaoMedia = concluidosComDuracao.length > 0
    ? Math.round(
        concluidosComDuracao.reduce((sum, a) => {
          const mins =
            (new Date(a.concluido_em!).getTime() - new Date(a.em_andamento_em!).getTime()) / 60_000
          return sum + mins
        }, 0) / concluidosComDuracao.length
      )
    : null

  return { totalMes, pendentesAgora, concluidosMes, ticketMedio, duracaoMedia }
}

export function computeBarData(appointments: Appointment[]): BarDataPoint[] {
  const now = new Date()
  const brtNow = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  const result: BarDataPoint[] = []

  // Build 6 buckets: oldest first (i=5), current month last (i=0)
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(brtNow.getUTCFullYear(), brtNow.getUTCMonth() - i, 1))
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth()
    const label = PT_MONTHS[month] + '/' + String(year).slice(-2)
    const start = new Date(Date.UTC(year, month, 1, 3, 0, 0, 0)).toISOString()
    const end = new Date(Date.UTC(year, month + 1, 1, 2, 59, 59, 999)).toISOString()
    const total = appointments.filter(a =>
      a.data_hora >= start && a.data_hora <= end
    ).length
    result.push({ month: label, total })
  }

  return result
}

export function computeDonutData(appointments: Appointment[]): DonutDataPoint[] {
  const counts: Record<string, number> = {}
  for (const a of appointments) {
    counts[a.servico] = (counts[a.servico] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useDashboard(): DashboardState {
  const [state, setState] = useState<DashboardState>({
    kpis: null,
    barData: [],
    donutData: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    getDashboardData().then(({ data, error }) => {
      if (cancelled) return
      if (error || !data) {
        setState(s => ({ ...s, isLoading: false, error: error ?? 'Erro desconhecido.' }))
        return
      }
      setState({
        kpis: computeKpis(data),
        barData: computeBarData(data),
        donutData: computeDonutData(data),
        isLoading: false,
        error: null,
      })
    })
    return () => { cancelled = true }
  }, [])

  return state
}
