import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// -----------------------------------------------------------------------
// vi.hoisted ensures these are available when vi.mock factory runs
// -----------------------------------------------------------------------
const { mockOrder, mockSelect, mockFrom, mockEq, mockUpdate } = vi.hoisted(() => {
  const mockOrder = vi.fn()
  const mockSelect = vi.fn(() => ({ order: mockOrder }))
  const mockEq = vi.fn()
  const mockUpdate = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect, update: mockUpdate }))
  return { mockOrder, mockSelect, mockFrom, mockEq, mockUpdate }
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}))

// Import after mocks are registered
import { fetchAppointments, updateAppointmentStatus, saveAppointmentNotes } from '@/services/appointments'
import { useAppointments } from '@/hooks/useAppointments'
import type { Appointment } from '@/types'

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: '1',
    nome: 'João Silva',
    whatsapp: '86999990000',
    endereco: 'Rua A, 1',
    servico: 'Limpeza de fossa',
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
// fetchAppointments service tests
// -----------------------------------------------------------------------
describe('fetchAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Restore chain after clearAllMocks resets return values
    mockSelect.mockReturnValue({ order: mockOrder })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, update: mockUpdate })
  })

  it('calls supabase.from("appointments").select("*").order("data_hora", { ascending: true })', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null })

    await fetchAppointments()

    expect(mockFrom).toHaveBeenCalledWith('appointments')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockOrder).toHaveBeenCalledWith('data_hora', { ascending: true })
  })

  it('returns { data: Appointment[], error: null } on success', async () => {
    const appointment = makeAppointment()
    mockOrder.mockResolvedValueOnce({ data: [appointment], error: null })

    const result = await fetchAppointments()

    expect(result.error).toBeNull()
    expect(result.data).toEqual([appointment])
  })

  it('returns { data: null, error: "Erro ao carregar agendamentos." } on Supabase error', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const result = await fetchAppointments()

    expect(result.data).toBeNull()
    expect(result.error).toBe('Erro ao carregar agendamentos.')
  })
})

// -----------------------------------------------------------------------
// useAppointments hook tests
// -----------------------------------------------------------------------
describe('updateAppointmentStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue({ order: mockOrder })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, update: mockUpdate })
  })

  it('calls supabase update with motivo_cancelamento when status is cancelado and motivo is given', async () => {
    mockEq.mockResolvedValueOnce({ error: null })

    await updateAppointmentStatus('id1', 'cancelado', 'Cliente desistiu')

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ motivo_cancelamento: 'Cliente desistiu' })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'id1')
  })

  it('does NOT include motivo_cancelamento when status is cancelado but motivo is not given', async () => {
    mockEq.mockResolvedValueOnce({ error: null })

    await updateAppointmentStatus('id1', 'cancelado')

    const updateArg = (mockUpdate.mock.calls as unknown as [Record<string, unknown>][])[0][0]
    expect(updateArg).not.toHaveProperty('motivo_cancelamento')
  })

  it('writes concluido_em when status is concluido, no motivo_cancelamento', async () => {
    mockEq.mockResolvedValueOnce({ error: null })

    await updateAppointmentStatus('id1', 'concluido')

    const updateArg = (mockUpdate.mock.calls as unknown as [Record<string, unknown>][])[0][0]
    expect(updateArg).toHaveProperty('concluido_em')
    expect(updateArg).not.toHaveProperty('motivo_cancelamento')
  })
})

describe('saveAppointmentNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue({ order: mockOrder })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, update: mockUpdate })
  })

  it('calls supabase update with { notas, atualizado_em } and eq("id", id)', async () => {
    mockEq.mockResolvedValueOnce({ error: null })

    await saveAppointmentNotes('id1', 'texto da nota')

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ notas: 'texto da nota' })
    )
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ atualizado_em: expect.any(String) })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'id1')
  })

  it('returns { error: null } on success', async () => {
    mockEq.mockResolvedValueOnce({ error: null })

    const result = await saveAppointmentNotes('id1', 'nota')

    expect(result).toEqual({ error: null })
  })

  it('returns { error: "Erro ao salvar nota." } on Supabase error', async () => {
    mockEq.mockResolvedValueOnce({ error: { message: 'DB error' } })

    const result = await saveAppointmentNotes('id1', 'nota')

    expect(result).toEqual({ error: 'Erro ao salvar nota.' })
  })
})

describe('useAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue({ order: mockOrder })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, update: mockUpdate })
  })

  it('starts with isLoading=true and empty filteredData', () => {
    // Never resolves — keeps loading state
    mockOrder.mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(() => useAppointments())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.filteredData).toEqual([])
  })

  it('sets isLoading=false and filteredData after fetch resolves', async () => {
    const appointment = makeAppointment()
    mockOrder.mockResolvedValueOnce({ data: [appointment], error: null })

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.filteredData).toEqual([appointment])
    expect(result.current.error).toBeNull()
  })

  it('sets error string and isLoading=false on fetch failure', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Erro ao carregar agendamentos.')
    expect(result.current.filteredData).toEqual([])
  })

  it('returns correct shape: { filteredData, serviceOptions, isLoading, error, filters, setFilters }', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current).toHaveProperty('filteredData')
    expect(result.current).toHaveProperty('serviceOptions')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('filters')
    expect(result.current).toHaveProperty('setFilters')
  })

  it('initial filters state is { tab: "todos", search: "", servico: "", dateFrom: "", dateTo: "" }', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.filters).toEqual({
      tab: 'todos',
      search: '',
      servico: '',
      dateFrom: '',
      dateTo: '',
    })
  })

  it('tab filter "pendente" shows only pendente appointments', async () => {
    const pending = makeAppointment({ id: '1', status: 'pendente' })
    const done = makeAppointment({ id: '2', status: 'concluido' })
    mockOrder.mockResolvedValueOnce({ data: [pending, done], error: null })

    const { result } = renderHook(() => useAppointments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    result.current.setFilters(f => ({ ...f, tab: 'pendente' }))

    await waitFor(() =>
      expect(result.current.filteredData).toEqual([pending])
    )
  })

  it('search filter matches nome case-insensitively', async () => {
    const a1 = makeAppointment({ id: '1', nome: 'João Silva' })
    const a2 = makeAppointment({ id: '2', nome: 'Maria Souza' })
    mockOrder.mockResolvedValueOnce({ data: [a1, a2], error: null })

    const { result } = renderHook(() => useAppointments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    result.current.setFilters(f => ({ ...f, search: 'JOÃO' }))

    await waitFor(() =>
      expect(result.current.filteredData).toEqual([a1])
    )
  })

  it('search filter matches whatsapp', async () => {
    const a1 = makeAppointment({ id: '1', whatsapp: '86911110000' })
    const a2 = makeAppointment({ id: '2', whatsapp: '86922220000' })
    mockOrder.mockResolvedValueOnce({ data: [a1, a2], error: null })

    const { result } = renderHook(() => useAppointments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    result.current.setFilters(f => ({ ...f, search: '1111' }))

    await waitFor(() =>
      expect(result.current.filteredData).toEqual([a1])
    )
  })

  it('servico filter narrows by exact service name', async () => {
    const a1 = makeAppointment({ id: '1', servico: 'Limpeza de fossa' })
    const a2 = makeAppointment({ id: '2', servico: 'Desentupimento' })
    mockOrder.mockResolvedValueOnce({ data: [a1, a2], error: null })

    const { result } = renderHook(() => useAppointments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    result.current.setFilters(f => ({ ...f, servico: 'Desentupimento' }))

    await waitFor(() =>
      expect(result.current.filteredData).toEqual([a2])
    )
  })

  it('dateFrom filter uses Date comparison (not string)', async () => {
    const future = makeAppointment({ id: '1', data_hora: '2026-07-01T10:00:00.000Z' })
    const past = makeAppointment({ id: '2', data_hora: '2026-05-01T10:00:00.000Z' })
    mockOrder.mockResolvedValueOnce({ data: [future, past], error: null })

    const { result } = renderHook(() => useAppointments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Filter from 2026-06-01 — should include future only
    result.current.setFilters(f => ({ ...f, dateFrom: '2026-06-01' }))

    await waitFor(() =>
      expect(result.current.filteredData).toEqual([future])
    )
  })

  it('dateTo filter includes appointments up to end of that day', async () => {
    const early = makeAppointment({ id: '1', data_hora: '2026-05-15T08:00:00.000Z' })
    const late = makeAppointment({ id: '2', data_hora: '2026-06-15T10:00:00.000Z' })
    mockOrder.mockResolvedValueOnce({ data: [early, late], error: null })

    const { result } = renderHook(() => useAppointments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Filter up to 2026-05-31 — only early should match
    result.current.setFilters(f => ({ ...f, dateTo: '2026-05-31' }))

    await waitFor(() =>
      expect(result.current.filteredData).toEqual([early])
    )
  })

  it('serviceOptions is derived from rawData (not filteredData) and sorted+deduped', async () => {
    const a1 = makeAppointment({ id: '1', servico: 'Desentupimento', status: 'pendente' })
    const a2 = makeAppointment({ id: '2', servico: 'Limpeza de fossa', status: 'concluido' })
    const a3 = makeAppointment({ id: '3', servico: 'Desentupimento', status: 'pendente' })
    mockOrder.mockResolvedValueOnce({ data: [a1, a2, a3], error: null })

    const { result } = renderHook(() => useAppointments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Even after filtering to 'pendente', serviceOptions should still include all services
    result.current.setFilters(f => ({ ...f, tab: 'pendente' }))

    await waitFor(() =>
      expect(result.current.filteredData.length).toBe(2)
    )

    // serviceOptions should still have both services (from rawData), sorted, deduped
    expect(result.current.serviceOptions).toEqual(['Desentupimento', 'Limpeza de fossa'])
  })
})
