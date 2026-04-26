import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import type { Appointment, AppointmentStatus } from '@/types'
import { StatusBadge } from './StatusBadge'
import { StatusSelect } from './StatusSelect'
import { CancelDialog } from './CancelDialog'
import { NotesEditor } from './NotesEditor'
import { WhatsAppButton } from './WhatsAppButton'

interface AppointmentsTableProps {
  data: Appointment[]
  onStatusChange?: (id: string, status: AppointmentStatus, motivo?: string) => void
  onSaveNotes?: (id: string, notes: string) => Promise<{ error: string | null }>
  onStartRequest?: (id: string) => void
  onCompleteRequest?: (id: string) => void
}

function AppointmentRow({
  a,
  onStatusChange,
  onSaveNotes,
  onStartRequest,
  onCompleteRequest,
}: {
  a: Appointment
  onStatusChange?: (id: string, status: AppointmentStatus, motivo?: string) => void
  onSaveNotes?: (id: string, notes: string) => Promise<{ error: string | null }>
  onStartRequest?: (id: string) => void
  onCompleteRequest?: (id: string) => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <tr className="hover:bg-zinc-50 transition-colors">
      <td className="px-4 py-3 text-sm text-zinc-900 max-w-[180px] truncate" title={a.nome}>{a.nome}</td>
      <td className="px-4 py-3 text-sm font-mono text-zinc-700 w-[140px]">{a.whatsapp}</td>
      <td className="px-4 py-3 text-sm text-zinc-700 max-w-[220px] truncate" title={a.endereco}>{a.endereco}</td>
      <td className="px-4 py-3 text-sm text-zinc-700">{a.servico}</td>
      <td className="px-4 py-3 text-sm text-zinc-700">
        {a.data_hora ? format(parseISO(a.data_hora), 'dd/MM/yyyy HH:mm') : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusBadge appointment={a} />
          {onStatusChange && (
            <StatusSelect
              value={a.status}
              onChange={status => onStatusChange(a.id, status)}
              onCancelRequest={() => setDialogOpen(true)}
              onStartRequest={() => onStartRequest?.(a.id)}
              onCompleteRequest={() => onCompleteRequest?.(a.id)}
            />
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-700">
        {a.criado_em ? format(parseISO(a.criado_em), 'dd/MM/yyyy') : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <WhatsAppButton whatsapp={a.whatsapp} />
        </div>
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
      </td>
    </tr>
  )
}

export function AppointmentsTable({ data, onStatusChange, onSaveNotes, onStartRequest, onCompleteRequest }: AppointmentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">
              Nome
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">
              WhatsApp
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">
              Endereço
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">
              Serviço
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">
              Data/Hora
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">
              Criado em
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.map((a) => (
            <AppointmentRow
              key={a.id}
              a={a}
              onStatusChange={onStatusChange}
              onSaveNotes={onSaveNotes}
              onStartRequest={onStartRequest}
              onCompleteRequest={onCompleteRequest}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
