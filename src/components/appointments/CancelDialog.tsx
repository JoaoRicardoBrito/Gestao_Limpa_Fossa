import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface CancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentName: string
  onConfirm: (motivo?: string) => Promise<{ error: string | null }>
}

export function CancelDialog({ open, onOpenChange, appointmentName, onConfirm }: CancelDialogProps) {
  const [motivo, setMotivo] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    setIsSaving(true)
    const { error } = await onConfirm(motivo.trim() || undefined)
    setIsSaving(false)
    if (error) { setError(error); return }
    setMotivo('')
    onOpenChange(false)
  }

  function handleCancel() {
    setMotivo('')
    setError(null)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja cancelar o agendamento de{' '}
            <span className="font-semibold text-zinc-900">{appointmentName}</span>?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1.5 px-0">
          <label className="text-sm text-zinc-700" htmlFor="cancel-motivo">
            Motivo (opcional)
          </label>
          <textarea
            id="cancel-motivo"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ex: cliente desmarcou, endereço errado..."
            rows={3}
            className="w-full text-sm border border-zinc-200 rounded px-3 py-2 resize-none
                       text-zinc-700 placeholder:text-zinc-400 focus:outline-none
                       focus:ring-2 focus:ring-blue-700/30 focus:border-blue-700 transition-colors"
            aria-label="Motivo do cancelamento"
          />
          {error && (
            <p className="text-sm text-red-500" role="alert">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSaving}>
            Voltar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isSaving}
            onClick={handleConfirm}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              'Confirmar cancelamento'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
