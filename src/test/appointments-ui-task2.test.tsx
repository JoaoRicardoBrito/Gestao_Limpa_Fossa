import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppointmentsTable } from '@/components/appointments/AppointmentsTable'
import { AppointmentCard } from '@/components/appointments/AppointmentCard'
import { SkeletonTable } from '@/components/appointments/SkeletonTable'
import { SkeletonCard } from '@/components/appointments/SkeletonCard'
import { EmptyState } from '@/components/appointments/EmptyState'
import type { Appointment } from '@/types'

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    nome: 'Maria Souza',
    whatsapp: '86999990001',
    endereco: 'Rua dos Testes, 42',
    servico: 'Limpeza de fossa',
    data_hora: '2026-06-15T14:30:00Z',
    criado_em: '2026-04-01T10:00:00Z',
    status: 'concluido',
    atualizado_em: null,
    concluido_em: null,
    cancelado_em: null,
    motivo_cancelamento: null,
    notas: null,
    valor: null,
    ...overrides,
  }
}

// ── AppointmentsTable ────────────────────────────────────────────────────────

describe('AppointmentsTable', () => {
  const appointments = [makeAppointment(), makeAppointment({ id: 'a2', nome: 'Carlos Lima', status: 'pendente' })]

  it('renders a semantic table element', () => {
    const { container } = render(<AppointmentsTable data={appointments} />)
    expect(container.querySelector('table')).toBeInTheDocument()
    expect(container.querySelector('thead')).toBeInTheDocument()
    expect(container.querySelector('tbody')).toBeInTheDocument()
  })

  it('renders 8 column headers with correct labels', () => {
    const { container } = render(<AppointmentsTable data={appointments} />)
    const headers = Array.from(container.querySelectorAll('th')).map(th => th.textContent)
    expect(headers).toContain('Nome')
    expect(headers).toContain('WhatsApp')
    expect(headers).toContain('Endereço')
    expect(headers).toContain('Serviço')
    expect(headers).toContain('Data/Hora')
    expect(headers).toContain('Status')
    expect(headers).toContain('Criado em')
    expect(headers).toContain('Ações')
  })

  it('all th elements have scope="col"', () => {
    const { container } = render(<AppointmentsTable data={appointments} />)
    const headers = container.querySelectorAll('th')
    expect(headers.length).toBe(8)
    headers.forEach(th => {
      expect(th).toHaveAttribute('scope', 'col')
    })
  })

  it('renders appointment data rows', () => {
    render(<AppointmentsTable data={appointments} />)
    expect(screen.getByText('Maria Souza')).toBeInTheDocument()
    expect(screen.getByText('Carlos Lima')).toBeInTheDocument()
  })

  it('formats data_hora as DD/MM/YYYY HH:mm', () => {
    render(<AppointmentsTable data={[makeAppointment()]} />)
    // 2026-06-15T14:30:00Z — formatted as dd/MM/yyyy HH:mm
    expect(screen.getByText(/15\/06\/2026/)).toBeInTheDocument()
  })

  it('formats criado_em as DD/MM/YYYY', () => {
    render(<AppointmentsTable data={[makeAppointment()]} />)
    expect(screen.getByText(/01\/04\/2026/)).toBeInTheDocument()
  })

  it('renders StatusBadge in status column', () => {
    render(<AppointmentsTable data={[makeAppointment({ status: 'concluido' })]} />)
    expect(screen.getByText('Concluído')).toBeInTheDocument()
  })
})

// ── AppointmentCard ──────────────────────────────────────────────────────────

describe('AppointmentCard', () => {
  const appointment = makeAppointment()

  it('renders the appointment name', () => {
    render(<AppointmentCard appointment={appointment} />)
    expect(screen.getByText('Maria Souza')).toBeInTheDocument()
  })

  it('renders StatusBadge', () => {
    render(<AppointmentCard appointment={appointment} />)
    expect(screen.getByText('Concluído')).toBeInTheDocument()
  })

  it('renders the service', () => {
    render(<AppointmentCard appointment={appointment} />)
    expect(screen.getByText('Limpeza de fossa')).toBeInTheDocument()
  })

  it('renders formatted data_hora', () => {
    render(<AppointmentCard appointment={appointment} />)
    expect(screen.getByText(/15\/06\/2026/)).toBeInTheDocument()
  })

  it('renders the whatsapp number', () => {
    render(<AppointmentCard appointment={appointment} />)
    expect(screen.getByText('86999990001')).toBeInTheDocument()
  })
})

// ── SkeletonTable ────────────────────────────────────────────────────────────

describe('SkeletonTable', () => {
  it('renders a container with aria-busy="true"', () => {
    const { container } = render(<SkeletonTable />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveAttribute('aria-busy', 'true')
  })

  it('renders aria-live="polite"', () => {
    const { container } = render(<SkeletonTable />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveAttribute('aria-live', 'polite')
  })

  it('renders sr-only loading text', () => {
    render(<SkeletonTable />)
    expect(screen.getByText('Carregando agendamentos...')).toBeInTheDocument()
  })

  it('renders 5 skeleton rows', () => {
    const { container } = render(<SkeletonTable />)
    // Each skeleton is an animated div — count animate-pulse elements
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(5)
  })
})

// ── SkeletonCard ─────────────────────────────────────────────────────────────

describe('SkeletonCard', () => {
  it('renders a container with aria-busy="true"', () => {
    const { container } = render(<SkeletonCard />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveAttribute('aria-busy', 'true')
  })

  it('renders aria-live="polite"', () => {
    const { container } = render(<SkeletonCard />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveAttribute('aria-live', 'polite')
  })

  it('renders sr-only loading text', () => {
    render(<SkeletonCard />)
    expect(screen.getByText('Carregando agendamentos...')).toBeInTheDocument()
  })

  it('renders 4 skeleton cards', () => {
    const { container } = render(<SkeletonCard />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(4)
  })
})

// ── EmptyState ───────────────────────────────────────────────────────────────

describe('EmptyState', () => {
  it('renders "Nenhum agendamento encontrado" when hasFilters is true', () => {
    render(<EmptyState hasFilters={true} />)
    expect(screen.getByText('Nenhum agendamento encontrado')).toBeInTheDocument()
    expect(
      screen.getByText('Tente ajustar os filtros ou a busca para ver resultados.')
    ).toBeInTheDocument()
  })

  it('renders "Nenhum agendamento encontrado" when hasFilters is undefined (default)', () => {
    render(<EmptyState />)
    expect(screen.getByText('Nenhum agendamento encontrado')).toBeInTheDocument()
  })

  it('renders "Ainda não há agendamentos cadastrados." when hasFilters=false', () => {
    render(<EmptyState hasFilters={false} />)
    expect(
      screen.getByText('Ainda não há agendamentos cadastrados.')
    ).toBeInTheDocument()
  })

  it('does not render inside a table element', () => {
    const { container } = render(<EmptyState />)
    expect(container.querySelector('table')).toBeNull()
    expect(container.querySelector('tbody')).toBeNull()
  })
})
