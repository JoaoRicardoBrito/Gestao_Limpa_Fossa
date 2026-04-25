import { format, parseISO } from 'date-fns'
import { Wrench, Calendar, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Appointment, AppointmentStatus } from '@/types'
import { StatusBadge } from './StatusBadge'
import { StatusSelect } from './StatusSelect'

interface AppointmentCardProps {
  appointment: Appointment
  onStatusChange?: (id: string, status: AppointmentStatus) => void
}

export function AppointmentCard({ appointment: a, onStatusChange }: AppointmentCardProps) {
  return (
    <Card className="border-zinc-200 shadow-none">
      <CardContent className="p-4 space-y-2">
        {/* Row 1: Nome + Status */}
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-zinc-900 text-sm truncate">{a.nome}</p>
          <StatusBadge appointment={a} />
        </div>

        {/* Row 2: Serviço */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Wrench className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{a.servico}</span>
        </div>

        {/* Row 3: Data/Hora */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{a.data_hora ? format(parseISO(a.data_hora), 'dd/MM/yyyy HH:mm') : '—'}</span>
        </div>

        {/* Row 4: WhatsApp */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono">{a.whatsapp}</span>
        </div>

        {/* Row 5: Mudar status */}
        {onStatusChange && (
          <div className="pt-1">
            <StatusSelect
              value={a.status}
              onChange={status => onStatusChange(a.id, status)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
