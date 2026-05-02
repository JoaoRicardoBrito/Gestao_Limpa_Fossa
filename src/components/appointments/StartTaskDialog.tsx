import { useState } from 'react'
import { Loader2, MessageCircle } from 'lucide-react'
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
import { formatStoredDate } from '@/lib/dateUtils'
import type { Motorista } from '@/types'
import type { Truck } from '@/services/trucks'

interface StartTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: { nome: string; endereco: string; data_hora: string }
  trucks: Truck[]
  motoristas: Motorista[]
  onConfirm: (caminhao_placa: string, motorista_id: string) => Promise<{ error: string | null }>
}

function buildWhatsAppLink(motorista: Motorista, appointment: { nome: string; endereco: string; data_hora: string }): string {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(appointment.endereco)}`
  const dataFormatada = formatStoredDate(appointment.data_hora, 'dd/MM/yyyy HH:mm')
  const msg = [
    `Olá ${motorista.nome}, você foi designado para um serviço.`,
    '',
    `Cliente: ${appointment.nome}`,
    `Endereço: ${appointment.endereco}`,
    `Data/Hora: ${dataFormatada}`,
    '',
    `📍 Localização: ${mapsUrl}`,
    '',
    '— Santa Clara ECO',
  ].join('\n')
  const phone = motorista.telefone.replace(/\D/g, '')
  return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
}

export function StartTaskDialog({
  open,
  onOpenChange,
  appointment,
  trucks,
  motoristas,
  onConfirm,
}: StartTaskDialogProps) {
  const [step, setStep] = useState<'select' | 'notify'>('select')
  const [selectedPlaca, setSelectedPlaca] = useState('')
  const [selectedMotoristaId, setSelectedMotoristaId] = useState('')
  const [confirmedMotorista, setConfirmedMotorista] = useState<Motorista | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!selectedPlaca || !selectedMotoristaId) return
    setError(null)
    setIsSaving(true)
    const { error } = await onConfirm(selectedPlaca, selectedMotoristaId)
    setIsSaving(false)
    if (error) { setError(error); return }
    // Advance to notification step
    const motorista = motoristas.find(m => m.id === selectedMotoristaId) ?? null
    setConfirmedMotorista(motorista)
    setStep('notify')
  }

  function handleClose() {
    setStep('select')
    setSelectedPlaca('')
    setSelectedMotoristaId('')
    setConfirmedMotorista(null)
    setError(null)
    onOpenChange(false)
  }

  function handleSendWhatsApp() {
    if (confirmedMotorista) {
      window.open(buildWhatsAppLink(confirmedMotorista, appointment), '_blank', 'noopener,noreferrer')
    }
    handleClose()
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <AlertDialogContent>
        {step === 'select' ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Iniciar tarefa</AlertDialogTitle>
              <AlertDialogDescription>
                Selecione o caminhão e o motorista que atenderão{' '}
                <span className="font-semibold text-zinc-900">{appointment.nome}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 px-0">
              {/* Caminhão */}
              <div className="space-y-2">
                <label className="text-sm text-zinc-700" htmlFor="truck-select">Caminhão</label>
                {trucks.length === 0 ? (
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
              </div>

              {/* Motorista */}
              <div className="space-y-2">
                <label className="text-sm text-zinc-700" htmlFor="motorista-select">Motorista</label>
                {motoristas.length === 0 ? (
                  <p className="text-sm text-red-500">
                    Nenhum motorista cadastrado. Cadastre um em Motoristas antes de iniciar.
                  </p>
                ) : (
                  <Select value={selectedMotoristaId} onValueChange={setSelectedMotoristaId}>
                    <SelectTrigger id="motorista-select" aria-label="Selecionar motorista">
                      <SelectValue placeholder="Selecione um motorista..." />
                    </SelectTrigger>
                    <SelectContent>
                      {motoristas.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose} disabled={isSaving}>
                Cancelar
              </AlertDialogCancel>
              <Button
                disabled={isSaving || !selectedPlaca || !selectedMotoristaId}
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
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Notificar motorista?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>Serviço iniciado. Deseja enviar a mensagem abaixo para {confirmedMotorista?.nome} via WhatsApp?</p>
                  <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-700 whitespace-pre-line font-mono leading-relaxed">
                    {confirmedMotorista && [
                      `Olá ${confirmedMotorista.nome}, você foi designado para um serviço.`,
                      '',
                      `Cliente: ${appointment.nome}`,
                      `Endereço: ${appointment.endereco}`,
                      `Data/Hora: ${formatStoredDate(appointment.data_hora, 'dd/MM/yyyy HH:mm')}`,
                      '',
                      `📍 maps.google.com/?q=${encodeURIComponent(appointment.endereco).slice(0, 30)}...`,
                      '',
                      '— Santa Clara ECO',
                    ].join('\n')}
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>
                Pular
              </AlertDialogCancel>
              <Button
                onClick={handleSendWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Enviar WhatsApp
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
