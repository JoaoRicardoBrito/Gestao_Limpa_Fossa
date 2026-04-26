import type { AppointmentStatus } from '@/types'

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

interface StatusSelectProps {
  value: AppointmentStatus
  onChange: (status: AppointmentStatus) => void
  onCancelRequest?: () => void
  onStartRequest?: () => void
  onCompleteRequest?: () => void
}

export function StatusSelect({ value, onChange, onCancelRequest, onStartRequest, onCompleteRequest }: StatusSelectProps) {
  return (
    <select
      value={value}
      onChange={e => {
        const next = e.target.value as AppointmentStatus
        if (next === 'cancelado' && onCancelRequest) {
          onCancelRequest()
        } else if (next === 'em_andamento' && onStartRequest) {
          onStartRequest()
        } else if (next === 'concluido' && onCompleteRequest) {
          onCompleteRequest()
        } else {
          onChange(next)
        }
      }}
      className="text-xs border border-zinc-200 rounded px-2 py-1 bg-white text-zinc-700 cursor-pointer hover:border-zinc-400 transition-colors"
      aria-label="Mudar status"
    >
      {STATUS_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
