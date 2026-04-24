import type { Appointment, AppointmentStatus } from '@/types'

interface StatusConfig {
  label: string
  className: string
  ariaLabel: string
}

const STATUS_MAP: Record<AppointmentStatus, StatusConfig> = {
  pendente: {
    label: 'Pendente',
    className: 'bg-yellow-100 text-yellow-800',
    ariaLabel: 'Status: Pendente',
  },
  em_andamento: {
    label: 'Em andamento',
    className: 'bg-blue-100 text-blue-700',
    ariaLabel: 'Status: Em andamento',
  },
  concluido: {
    label: 'Concluído',
    className: 'bg-green-100 text-green-700',
    ariaLabel: 'Status: Concluído',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-zinc-100 text-zinc-500',
    ariaLabel: 'Status: Cancelado',
  },
}

const BASE_CLASSES = 'rounded-full px-2 py-0.5 text-xs font-semibold'

interface StatusBadgeProps {
  appointment: Appointment
}

export function StatusBadge({ appointment }: StatusBadgeProps) {
  const isAtrasado =
    appointment.status === 'pendente' &&
    new Date(appointment.data_hora) < new Date()

  if (isAtrasado) {
    return (
      <span
        className={`${BASE_CLASSES} bg-orange-100 text-orange-700`}
        aria-label="Status: Atrasado (pendente e data passada)"
      >
        Atrasado
      </span>
    )
  }

  const config = STATUS_MAP[appointment.status] ?? {
    label: appointment.status ?? 'Desconhecido',
    className: 'bg-zinc-100 text-zinc-500',
    ariaLabel: `Status: ${appointment.status ?? 'desconhecido'}`,
  }

  return (
    <span
      className={`${BASE_CLASSES} ${config.className}`}
      aria-label={config.ariaLabel}
    >
      {config.label}
    </span>
  )
}
