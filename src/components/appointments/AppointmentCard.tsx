import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Wrench, Calendar, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Appointment, AppointmentStatus } from '@/types'
import { StatusBadge } from './StatusBadge'
import { StatusSelect } from './StatusSelect'
import { CancelDialog } from './CancelDialog'
import { NotesEditor } from './NotesEditor'
import { WhatsAppButton } from './WhatsAppButton'

interface AppointmentCardProps {
  appointment: Appointment
  onStatusChange?: (id: string, status: AppointmentStatus, motivo?: string) => void
  onSaveNotes?: (id: string, notes: string) => Promise<{ error: string | null }>
}

export function AppointmentCard({ appointment: a, onStatusChange, onSaveNotes }: AppointmentCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

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

        {/* Row 4: WhatsApp number */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono">{a.whatsapp}</span>
        </div>

        {/* Row 5: Actions row — WhatsApp button + Status select */}
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <WhatsAppButton whatsapp={a.whatsapp} />
          {onStatusChange && (
            <StatusSelect
              value={a.status}
              onChange={status => onStatusChange(a.id, status)}
              onCancelRequest={() => setDialogOpen(true)}
            />
          )}
        </div>

        {/* Row 6: Notes */}
        {onSaveNotes && (
          <NotesEditor
            appointmentId={a.id}
            initialNotes={a.notas}
            onSave={onSaveNotes}
          />
        )}

        <CancelDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          appointmentName={a.nome}
          onConfirm={async (motivo) => {
            if (!onStatusChange) return { error: null }
            await onStatusChange(a.id, 'cancelado', motivo)
            return { error: null }
          }}
        />
      </CardContent>
    </Card>
  )
}
