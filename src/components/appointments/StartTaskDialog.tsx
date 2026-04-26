import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { useTrucks } from '@/hooks/useTrucks'

interface StartTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentName: string
  onConfirm: (caminhao_placa: string) => Promise<{ error: string | null }>
}

export function StartTaskDialog({
  open,
  onOpenChange,
  appointmentName,
  onConfirm,
}: StartTaskDialogProps) {
  const [selectedPlaca, setSelectedPlaca] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { trucks, isLoading: trucksLoading } = useTrucks()

  async function handleConfirm() {
    if (!selectedPlaca) return
    setError(null)
    setIsSaving(true)
    const { error } = await onConfirm(selectedPlaca)
    setIsSaving(false)
    if (error) { setError(error); return }
    setSelectedPlaca('')
    onOpenChange(false)
  }

  function handleCancel() {
    setSelectedPlaca('')
    setError(null)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Iniciar tarefa</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione o caminhão que atenderá{' '}
            <span className="font-semibold text-zinc-900">{appointmentName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1.5 px-0">
          <label className="text-sm text-zinc-700" htmlFor="truck-select">
            Caminhão
          </label>
          {trucksLoading ? (
            <p className="text-sm text-zinc-500">Carregando caminhões...</p>
          ) : trucks.length === 0 ? (
            <p className="text-sm text-red-500">
              Nenhum caminhão cadastrado. Cadastre um em Caminhões antes de iniciar.
            </p>
          ) : (
            <Select value={selectedPlaca} onValueChange={setSelectedPlaca}>
              <SelectTrigger id="truck-select" aria-label="Selecionar caminhão">
                <SelectValue placeholder="Selecione um caminhão..." />
              </SelectTrigger>
              <SelectContent>
                {trucks.map((truck) => (
                  <SelectItem key={truck.id} value={truck.placa}>
                    {truck.placa} — {truck.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {error && (
            <p className="text-sm text-red-500" role="alert">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSaving}>
            Cancelar
          </AlertDialogCancel>
          <Button
            disabled={isSaving || !selectedPlaca}
            onClick={handleConfirm}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              'Confirmar início'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
