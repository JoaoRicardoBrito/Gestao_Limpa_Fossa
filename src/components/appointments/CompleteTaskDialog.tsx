import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface CompleteTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentName: string
  onConfirm: (valor: number) => Promise<{ error: string | null }>
}

export function CompleteTaskDialog({
  open,
  onOpenChange,
  appointmentName,
  onConfirm,
}: CompleteTaskDialogProps) {
  const [valorStr, setValorStr] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valorNum = parseFloat(valorStr)
  const isValid = valorStr.trim() !== '' && !isNaN(valorNum) && valorNum >= 0

  async function handleConfirm() {
    if (!isValid) return
    setError(null)
    setIsSaving(true)
    const { error } = await onConfirm(valorNum)
    setIsSaving(false)
    if (error) { setError(error); return }
    setValorStr('')
    onOpenChange(false)
  }

  function handleCancel() {
    setValorStr('')
    setError(null)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Concluir agendamento</AlertDialogTitle>
          <AlertDialogDescription>
            Informe o valor cobrado para concluir o atendimento de{' '}
            <span className="font-semibold text-zinc-900">{appointmentName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1.5 px-0">
          <label className="text-sm text-zinc-700" htmlFor="valor-input">
            Valor cobrado (R$)
          </label>
          <Input
            id="valor-input"
            type="number"
            step="0.01"
            min="0"
            value={valorStr}
            onChange={e => setValorStr(e.target.value)}
            placeholder="Ex: 250.00"
            aria-label="Valor cobrado"
          />
          {error && (
            <p className="text-sm text-red-500" role="alert">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSaving}>
            Cancelar
          </AlertDialogCancel>
          <Button
            disabled={isSaving || !isValid}
            onClick={handleConfirm}
            className="bg-green-700 hover:bg-green-800 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Concluindo...
              </>
            ) : (
              'Confirmar conclusão'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
