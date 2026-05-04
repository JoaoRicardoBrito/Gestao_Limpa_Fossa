import { useEffect, useState, useMemo } from 'react'
import { getDashboardData, fetchMotoristasBasic } from '@/services/dashboard'
import type { Appointment } from '@/types'

// ─── Period type ───────────────────────────────────────────────────────────

export type DashboardPeriod = 'semana' | 'mes' | 'semestre'

// ─── Exported types ────────────────────────────────────────────────────────

export interface KpiData {
  totalMes: number          // "total no período" — field kept for test compat
  pendentesAgora: number
  concluidosMes: number     // "concluídos no período" — field kept for test compat
  ticketMedio: number | null
  duracaoMedia: number | null
  faturamentoTotal: number | null
}

export interface BarDataPoint {
  month: string   // day or month label
  total: number
}

export interface DonutDataPoint {
  name: string
  value: number
}

export interface RankingDataPoint {
  name: string
  total: number
}

export interface DashboardState {
  period: DashboardPeriod
  setPeriod: (p: DashboardPeriod) => void
  kpis: KpiData | null
  barData: BarDataPoint[]
  donutData: DonutDataPoint[]
  motoristaData: RankingDataPoint[]
  caminhaoData: RankingDataPoint[]
  isLoading: boolean
  error: string | null
}

// ─── Period range helpers ──────────────────────────────────────────────────
// All ranges computed in BRT (UTC-3). Vercel runs UTC — must shift explicitly.

export function getCurrentMonthRangeISO(): { start: string; end: string } {
  const brtNow = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const y = brtNow.getUTCFullYear(), m = brtNow.getUTCMonth()
  return {
    start: new Date(Date.UTC(y, m, 1, 3, 0, 0, 0)).toISOString(),
    end:   new Date(Date.UTC(y, m + 1, 1, 2, 59, 59, 999)).toISOString(),
  }
}

function getWeekRangeISO(): { start: string; end: string } {
  const brtNow = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const dow = brtNow.getUTCDay() // 0=Sun
  const daysFromMonday = dow === 0 ? 6 : dow - 1
  const y = brtNow.getUTCFullYear(), m = brtNow.getUTCMonth()
  const d = brtNow.getUTCDate() - daysFromMonday
  return {
    start: new Date(Date.UTC(y, m, d,     3, 0,  0,   0)).toISOString(),
    end:   new Date(Date.UTC(y, m, d + 7, 2, 59, 59, 999)).toISOString(),
  }
}

function getSemesterRangeISO(): { start: string; end: string } {
  const brtNow = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const y = brtNow.getUTCFullYear(), m = brtNow.getUTCMonth()
  return {
    start: new Date(Date.UTC(y, m - 5, 1, 3, 0, 0, 0)).toISOString(),
    end:   new Date(Date.UTC(y, m + 1, 1, 2, 59, 59, 999)).toISOString(),
  }
}

export function getPeriodRange(period: DashboardPeriod): { start: string; end: string } {
  if (period === 'semana')   return getWeekRangeISO()
  if (period === 'semestre') return getSemesterRangeISO()
  return getCurrentMonthRangeISO()
}

// Portuguese abbreviations
const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const PT_DAYS   = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// ─── Pure aggregation helpers ──────────────────────────────────────────────

export function computeKpis(
  appointments: Appointment[],
  period: DashboardPeriod = 'mes'
): KpiData {
  const { start, end } = getPeriodRange(period)

  const totalMes = appointments.filter(a =>
    a.data_hora >= start && a.data_hora <= end
  ).length

  const pendentesAgora = appointments.filter(a => a.status === 'pendente').length

  const concluidosNoPeriodo = appointments.filter(a =>
    a.status === 'concluido' &&
    a.concluido_em != null &&
    a.concluido_em >= start &&
    a.concluido_em <= end
  )

  const concluidosMes = concluidosNoPeriodo.length

  const comValor = concluidosNoPeriodo.filter(a => a.valor != null)
  const ticketMedio = comValor.length > 0
    ? Math.round(comValor.reduce((s, a) => s + (a.valor ?? 0), 0) / comValor.length)
    : null

  const faturamentoTotal = comValor.length > 0
    ? Math.round(comValor.reduce((s, a) => s + (a.valor ?? 0), 0))
    : null

  const comDuracao = concluidosNoPeriodo.filter(a => a.em_andamento_em != null)
  const duracaoMedia = comDuracao.length > 0
    ? (() => {
        let totalMins = 0, count = 0
        for (const a of comDuracao) {
          const mins = (new Date(a.concluido_em!).getTime() - new Date(a.em_andamento_em!).getTime()) / 60_000
          if (!isNaN(mins) && mins >= 0) { totalMins += mins; count++ }
        }
        return count > 0 ? Math.round(totalMins / count) : null
      })()
    : null

  return { totalMes, pendentesAgora, concluidosMes, ticketMedio, duracaoMedia, faturamentoTotal }
}

export function computeBarData(
  appointments: Appointment[],
  period: DashboardPeriod = 'mes'
): BarDataPoint[] {
  if (period === 'semana') {
    // 7 daily buckets Mon→Sun in BRT
    const brtNow = new Date(Date.now() - 3 * 60 * 60 * 1000)
    const dow = brtNow.getUTCDay()
    const daysFromMonday = dow === 0 ? 6 : dow - 1
    const y = brtNow.getUTCFullYear(), mo = brtNow.getUTCMonth()
    const mondayDate = brtNow.getUTCDate() - daysFromMonday
    return Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date(Date.UTC(y, mo, mondayDate + i,     3, 0,  0,   0))
      const dayEnd   = new Date(Date.UTC(y, mo, mondayDate + i + 1, 2, 59, 59, 999))
      const s = dayStart.toISOString(), e = dayEnd.toISOString()
      // dayStart is Monday 03:00 UTC = Monday 00:00 BRT, day of week = 1 (Mon)
      const dayOfWeek = (1 + i) % 7 // Mon=1..Sun=0
      const label = PT_DAYS[dayOfWeek === 0 ? 0 : dayOfWeek]
      const total = appointments.filter(a => a.data_hora >= s && a.data_hora <= e).length
      return { month: label, total }
    })
  }

  // 6-month buckets (mes and semestre share this view)
  const brtNow = new Date(Date.now() - 3 * 60 * 60 * 1000)
  return Array.from({ length: 6 }, (_, i) => {
    const offset = 5 - i
    const d = new Date(Date.UTC(brtNow.getUTCFullYear(), brtNow.getUTCMonth() - offset, 1))
    const y = d.getUTCFullYear(), m = d.getUTCMonth()
    const label = PT_MONTHS[m] + '/' + String(y).slice(-2)
    const s = new Date(Date.UTC(y, m,     1, 3, 0,  0,   0)).toISOString()
    const e = new Date(Date.UTC(y, m + 1, 1, 2, 59, 59, 999)).toISOString()
    const total = appointments.filter(a => a.data_hora >= s && a.data_hora <= e).length
    return { month: label, total }
  })
}

const SLUG_TO_LABEL: Record<string, string> = {
  'limpeza-fossa':   'Limpeza de Fossa',
  'hidrojateamento': 'Hidrojetamento',
  'caixa-gordura':   'Caixa de Gordura',
  'desentupimento':  'Desentupimento de Rede de Esgoto',
}
function normalizeServico(raw: string): string { return SLUG_TO_LABEL[raw] ?? raw }

export function computeDonutData(
  appointments: Appointment[],
  period: DashboardPeriod = 'mes'
): DonutDataPoint[] {
  const { start, end } = getPeriodRange(period)
  const counts: Record<string, number> = {}
  for (const a of appointments) {
    if (a.data_hora < start || a.data_hora > end) continue
    const label = normalizeServico(a.servico)
    counts[label] = (counts[label] ?? 0) + 1
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

export function computeMotoristaRanking(
  appointments: Appointment[],
  motoristas: { id: string; nome: string }[],
  period: DashboardPeriod = 'mes'
): RankingDataPoint[] {
  const { start, end } = getPeriodRange(period)
  const counts: Record<string, number> = {}
  for (const a of appointments) {
    if (a.status !== 'concluido' || !a.motorista_id) continue
    if (a.concluido_em == null || a.concluido_em < start || a.concluido_em > end) continue
    counts[a.motorista_id] = (counts[a.motorista_id] ?? 0) + 1
  }
  const nameMap = new Map(motoristas.map(m => [m.id, m.nome]))
  return Object.entries(counts)
    .map(([id, total]) => ({ name: nameMap.get(id) ?? id, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
}

export function computeCaminhaoRanking(
  appointments: Appointment[],
  period: DashboardPeriod = 'mes'
): RankingDataPoint[] {
  const { start, end } = getPeriodRange(period)
  const counts: Record<string, number> = {}
  for (const a of appointments) {
    if (a.status !== 'concluido' || !a.caminhao_placa) continue
    if (a.concluido_em == null || a.concluido_em < start || a.concluido_em > end) continue
    counts[a.caminhao_placa] = (counts[a.caminhao_placa] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([placa, total]) => ({ name: placa, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useDashboard(): DashboardState {
  const [period, setPeriod] = useState<DashboardPeriod>('mes')
  const [rawAppointments, setRawAppointments] = useState<Appointment[] | null>(null)
  const [motoristas, setMotoristas] = useState<{ id: string; nome: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch once — recomputation happens client-side on period change
  useEffect(() => {
    let cancelled = false
    Promise.all([getDashboardData(), fetchMotoristasBasic()]).then(([appts, mots]) => {
      if (cancelled) return
      if (appts.error || !appts.data) {
        setError(appts.error ?? 'Erro desconhecido.')
        setIsLoading(false)
        return
      }
      setRawAppointments(appts.data)
      setMotoristas(mots)
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  // Recompute synchronously on period or data change — no extra fetch
  const computed = useMemo(() => {
    if (!rawAppointments) return null
    return {
      kpis:          computeKpis(rawAppointments, period),
      barData:       computeBarData(rawAppointments, period),
      donutData:     computeDonutData(rawAppointments, period),
      motoristaData: computeMotoristaRanking(rawAppointments, motoristas, period),
      caminhaoData:  computeCaminhaoRanking(rawAppointments, period),
    }
  }, [rawAppointments, motoristas, period])

  return {
    period,
    setPeriod,
    kpis:          computed?.kpis ?? null,
    barData:       computed?.barData ?? [],
    donutData:     computed?.donutData ?? [],
    motoristaData: computed?.motoristaData ?? [],
    caminhaoData:  computed?.caminhaoData ?? [],
    isLoading,
    error,
  }
}
