import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Appointment } from '@/types'

// -----------------------------------------------------------------------
// vi.hoisted ensures these are available when vi.mock factory runs
// -----------------------------------------------------------------------
const { mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn()
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return { mockFrom }
})

vi.mock('@/lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

// Import pure helpers after mock registration
import {
  getCurrentMonthRangeISO,
  computeKpis,
  computeBarData,
  computeDonutData,
} from '@/hooks/useDashboard'

// -----------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------
function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: '1',
    nome: 'João Silva',
    whatsapp: '86999990000',
    endereco: 'Rua A, 1',
    servico: 'Limpeza de fossa',
    // Default data_hora is in June 2026 — NOT in the mocked April 2026 month
    data_hora: '2026-06-01T10:00:00.000Z',
    criado_em: '2026-05-01T00:00:00.000Z',
    status: 'pendente',
    atualizado_em: null,
    concluido_em: null,
    cancelado_em: null,
    motivo_cancelamento: null,
    notas: null,
    valor: null,
    ...overrides,
  }
}

// -----------------------------------------------------------------------
// getCurrentMonthRangeISO
// -----------------------------------------------------------------------
describe('getCurrentMonthRangeISO', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock time: April 15, 2026 at 12:00 UTC = April 15, 2026 at 09:00 BRT
    vi.setSystemTime(new Date('2026-04-15T12:00:00.000Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('start is midnight BRT April 1 = 2026-04-01T03:00:00.000Z', () => {
    expect(getCurrentMonthRangeISO().start).toBe('2026-04-01T03:00:00.000Z')
  })

  it('end is last millisecond of April in BRT = 2026-05-01T02:59:59.999Z', () => {
    expect(getCurrentMonthRangeISO().end).toBe('2026-05-01T02:59:59.999Z')
  })

  it('start is before end', () => {
    const { start, end } = getCurrentMonthRangeISO()
    expect(new Date(start) < new Date(end)).toBe(true)
  })
})

// -----------------------------------------------------------------------
// computeKpis
// -----------------------------------------------------------------------
describe('computeKpis', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-15T12:00:00.000Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('totalMes counts all statuses in current BRT month', () => {
    const appts = [
      makeAppointment({ data_hora: '2026-04-10T10:00:00.000Z', status: 'pendente' }),
      makeAppointment({ data_hora: '2026-04-20T10:00:00.000Z', status: 'concluido', concluido_em: '2026-04-20T11:00:00.000Z' }),
      makeAppointment({ data_hora: '2026-03-15T10:00:00.000Z', status: 'pendente' }), // previous month — excluded
    ]
    expect(computeKpis(appts).totalMes).toBe(2)
  })

  it('pendentesAgora counts all pendente regardless of date', () => {
    const appts = [
      makeAppointment({ status: 'pendente', data_hora: '2026-01-01T10:00:00.000Z' }),
      makeAppointment({ status: 'pendente', data_hora: '2026-04-10T10:00:00.000Z' }),
      makeAppointment({ status: 'concluido', data_hora: '2026-04-10T10:00:00.000Z', concluido_em: '2026-04-10T11:00:00.000Z' }),
    ]
    expect(computeKpis(appts).pendentesAgora).toBe(2)
  })

  it('concluidosMes counts concluido with concluido_em in current BRT month', () => {
    const appts = [
      makeAppointment({ status: 'concluido', data_hora: '2026-04-10T10:00:00.000Z', concluido_em: '2026-04-10T11:00:00.000Z' }),
      makeAppointment({ status: 'concluido', data_hora: '2026-03-10T10:00:00.000Z', concluido_em: '2026-03-10T11:00:00.000Z' }), // previous month — excluded
    ]
    expect(computeKpis(appts).concluidosMes).toBe(1)
  })

  it('ticketMedio returns null when no concluido with valor in current month', () => {
    const appts = [
      makeAppointment({ status: 'pendente', data_hora: '2026-04-10T10:00:00.000Z' }),
      makeAppointment({ status: 'concluido', data_hora: '2026-04-10T10:00:00.000Z', concluido_em: '2026-04-10T11:00:00.000Z', valor: null }),
    ]
    expect(computeKpis(appts).ticketMedio).toBeNull()
  })

  it('ticketMedio returns rounded integer average for concluido with valor in current month', () => {
    const appts = [
      makeAppointment({ status: 'concluido', data_hora: '2026-04-10T10:00:00.000Z', concluido_em: '2026-04-10T11:00:00.000Z', valor: 400 }),
      makeAppointment({ status: 'concluido', data_hora: '2026-04-12T10:00:00.000Z', concluido_em: '2026-04-12T11:00:00.000Z', valor: 500 }),
      makeAppointment({ status: 'concluido', data_hora: '2026-04-12T10:00:00.000Z', concluido_em: '2026-04-12T11:00:00.000Z', valor: null }), // excluded — valor is null
    ]
    expect(computeKpis(appts).ticketMedio).toBe(450)
  })

  it('ticketMedio ignores concluido appointments outside current month', () => {
    const appts = [
      makeAppointment({ status: 'concluido', data_hora: '2026-03-10T10:00:00.000Z', concluido_em: '2026-03-10T11:00:00.000Z', valor: 1000 }), // prior month — excluded
    ]
    expect(computeKpis(appts).ticketMedio).toBeNull()
  })
})

// -----------------------------------------------------------------------
// computeBarData
// -----------------------------------------------------------------------
describe('computeBarData', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-15T12:00:00.000Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns exactly 6 items', () => {
    expect(computeBarData([])).toHaveLength(6)
  })

  it('last item month label is current BRT month (Abr/26)', () => {
    const result = computeBarData([])
    expect(result[5].month).toBe('Abr/26')
  })

  it('first item month label is 5 months ago (Nov/25)', () => {
    const result = computeBarData([])
    expect(result[0].month).toBe('Nov/25')
  })

  it('correctly counts appointments in specific month buckets', () => {
    const appts = [
      makeAppointment({ data_hora: '2026-04-10T10:00:00.000Z' }), // April BRT
      makeAppointment({ data_hora: '2026-04-20T10:00:00.000Z' }), // April BRT
      makeAppointment({ data_hora: '2026-03-10T10:00:00.000Z' }), // March BRT
    ]
    const result = computeBarData(appts)
    expect(result[5].total).toBe(2) // April = index 5 (current month)
    expect(result[4].total).toBe(1) // March = index 4
  })
})

// -----------------------------------------------------------------------
// computeDonutData
// -----------------------------------------------------------------------
describe('computeDonutData', () => {
  it('returns empty array for no appointments', () => {
    expect(computeDonutData([])).toEqual([])
  })

  it('groups by servico field', () => {
    const appts = [
      makeAppointment({ servico: 'Limpeza de fossa' }),
      makeAppointment({ servico: 'Limpeza de fossa' }),
      makeAppointment({ servico: 'Desentupimento' }),
    ]
    const result = computeDonutData(appts)
    expect(result).toHaveLength(2)
    expect(result.find(r => r.name === 'Limpeza de fossa')?.value).toBe(2)
    expect(result.find(r => r.name === 'Desentupimento')?.value).toBe(1)
  })

  it('sorts descending by count', () => {
    const appts = [
      makeAppointment({ servico: 'Desentupimento' }),
      makeAppointment({ servico: 'Limpeza de fossa' }),
      makeAppointment({ servico: 'Limpeza de fossa' }),
    ]
    const result = computeDonutData(appts)
    expect(result[0].name).toBe('Limpeza de fossa')
    expect(result[0].value).toBe(2)
  })

  it('handles single service type', () => {
    const appts = [
      makeAppointment({ servico: 'Limpeza de fossa' }),
      makeAppointment({ servico: 'Limpeza de fossa' }),
    ]
    const result = computeDonutData(appts)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ name: 'Limpeza de fossa', value: 2 })
  })
})
