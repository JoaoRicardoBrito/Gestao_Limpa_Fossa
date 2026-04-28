import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '@/components/appointments/StatusBadge'
import { AppointmentsTabs } from '@/components/appointments/AppointmentsTabs'
import { AppointmentsFilters } from '@/components/appointments/AppointmentsFilters'
import type { Appointment } from '@/types'

// Helper to create a minimal Appointment for tests
function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    nome: 'João Silva',
    whatsapp: '86999999999',
    endereco: 'Rua A, 1',
    servico: 'Limpeza de fossa',
    data_hora: '2030-12-31T10:00:00Z', // future date
    criado_em: '2026-01-01T00:00:00Z',
    status: 'pendente',
    atualizado_em: null,
    concluido_em: null,
    cancelado_em: null,
    motivo_cancelamento: null,
    notas: null,
    valor: null,
    em_andamento_em: null,
    caminhao_placa: null,
    ...overrides,
  }
}

// ── StatusBadge ──────────────────────────────────────────────────────────────

describe('StatusBadge', () => {
  it('renders "Pendente" badge for pending future appointment', () => {
    render(<StatusBadge appointment={makeAppointment({ status: 'pendente' })} />)
    const badge = screen.getByText('Pendente')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Status: Pendente')
    expect(badge.className).toContain('bg-yellow-100')
    expect(badge.className).toContain('text-yellow-800')
  })

  it('renders "Atrasado" badge for pending past appointment', () => {
    render(
      <StatusBadge
        appointment={makeAppointment({
          status: 'pendente',
          data_hora: '2020-01-01T10:00:00Z', // past date
        })}
      />
    )
    const badge = screen.getByText('Atrasado')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute(
      'aria-label',
      'Status: Atrasado (pendente e data passada)'
    )
    expect(badge.className).toContain('bg-orange-100')
    expect(badge.className).toContain('text-orange-700')
  })

  it('renders "Em andamento" badge', () => {
    render(
      <StatusBadge
        appointment={makeAppointment({ status: 'em_andamento' })}
      />
    )
    const badge = screen.getByText('Em andamento')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Status: Em andamento')
    expect(badge.className).toContain('bg-blue-100')
    expect(badge.className).toContain('text-blue-700')
  })

  it('renders "Concluído" badge', () => {
    render(
      <StatusBadge appointment={makeAppointment({ status: 'concluido' })} />
    )
    const badge = screen.getByText('Concluído')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Status: Concluído')
    expect(badge.className).toContain('bg-green-100')
    expect(badge.className).toContain('text-green-700')
  })

  it('renders "Cancelado" badge', () => {
    render(
      <StatusBadge appointment={makeAppointment({ status: 'cancelado' })} />
    )
    const badge = screen.getByText('Cancelado')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Status: Cancelado')
    expect(badge.className).toContain('bg-zinc-100')
    expect(badge.className).toContain('text-zinc-500')
  })

  it('applies base badge classes on all variants', () => {
    render(<StatusBadge appointment={makeAppointment({ status: 'concluido' })} />)
    const badge = screen.getByText('Concluído')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('px-2')
    expect(badge.className).toContain('text-xs')
    expect(badge.className).toContain('font-semibold')
  })
})

// ── AppointmentsTabs ─────────────────────────────────────────────────────────

describe('AppointmentsTabs', () => {
  it('renders 5 tab triggers with correct labels', () => {
    render(
      <AppointmentsTabs activeTab="todos" onTabChange={() => {}} />
    )
    expect(screen.getByRole('tab', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Pendentes' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Em andamento' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Concluídos' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Cancelados' })).toBeInTheDocument()
  })

  it('renders tabs in the correct order', () => {
    render(
      <AppointmentsTabs activeTab="todos" onTabChange={() => {}} />
    )
    const tabs = screen.getAllByRole('tab')
    const labels = tabs.map(t => t.textContent)
    expect(labels).toEqual(['Todos', 'Pendentes', 'Em andamento', 'Concluídos', 'Cancelados'])
  })

  it('marks the activeTab trigger as selected', () => {
    render(
      <AppointmentsTabs activeTab="pendente" onTabChange={() => {}} />
    )
    const pendentesTab = screen.getByRole('tab', { name: 'Pendentes' })
    expect(pendentesTab).toHaveAttribute('data-state', 'active')
  })
})

// ── AppointmentsFilters ──────────────────────────────────────────────────────

describe('AppointmentsFilters', () => {
  const defaultProps = {
    search: '',
    servico: '',
    dateFrom: '',
    dateTo: '',
    serviceOptions: ['Limpeza de fossa', 'Desentupimento'],
    onSearchChange: () => {},
    onServicoChange: () => {},
    onDateFromChange: () => {},
    onDateToChange: () => {},
    onClear: () => {},
  }

  it('renders the search input with correct placeholder and aria-label', () => {
    render(<AppointmentsFilters {...defaultProps} />)
    const input = screen.getByPlaceholderText('Buscar por nome ou WhatsApp')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-label', 'Buscar agendamentos')
  })

  it('renders two date inputs', () => {
    render(<AppointmentsFilters {...defaultProps} />)
    const dateInputs = document.querySelectorAll('input[type="date"]')
    expect(dateInputs).toHaveLength(2)
  })

  it('renders the clear filters button', () => {
    render(<AppointmentsFilters {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument()
  })
})
