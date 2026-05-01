import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Loader2, UserPlus, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createAppointment } from '@/services/appointments'

const SERVICOS = [
  'Limpeza de Fossa',
  'Hidrojetamento',
  'Caixa de Gordura',
  'Desentupimento de Rede de Esgoto',
] as const

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório.'),
  whatsapp: z.string().min(10, 'WhatsApp deve ter pelo menos 10 dígitos.'),
  endereco: z.string().min(5, 'Endereço obrigatório.'),
  servico: z.enum(SERVICOS, { errorMap: () => ({ message: 'Selecione um serviço.' }) }),
  data_hora: z.string().min(1, 'Data e hora obrigatórias.'),
  notas: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-500 mt-0.5" role="alert">{message}</p>
}

export function CadastrarClientePage() {
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setFormError(null)
    const { error } = await createAppointment(data)
    if (error) { setFormError(error); return }
    reset()
    setSuccess(true)
  }

  return (
    <div className="p-4 xl:p-8 space-y-6 max-w-2xl">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Cadastrar Cliente</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Registre clientes que entraram em contato fora do site.
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex flex-wrap items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800 flex-1">
            Cliente cadastrado com sucesso!
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSuccess(false)}
              className="text-green-700 hover:bg-green-100 text-xs"
            >
              Cadastrar outro
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/agendamentos')}
              className="bg-green-700 hover:bg-green-800 text-white text-xs"
            >
              Ver agendamentos
            </Button>
          </div>
        </div>
      )}

      {/* Form card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 space-y-5">
        <h2 className="text-sm font-semibold text-zinc-900">Dados do cliente</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Nome + WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <Input {...register('nome')} placeholder="Ex: João Silva" />
              <FieldError message={errors.nome?.message} />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <Input {...register('whatsapp')} placeholder="(86) 99999-0000" inputMode="tel" />
              <FieldError message={errors.whatsapp?.message} />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="text-xs font-medium text-zinc-700 block mb-1">
              Endereço <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('endereco')}
              placeholder="Ex: Rua das Flores, 123 — Bairro Centro, Teresina"
            />
            <FieldError message={errors.endereco?.message} />
          </div>

          {/* Serviço + Data/Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">
                Serviço <span className="text-red-500">*</span>
              </label>
              <Controller
                name="servico"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Selecionar serviço">
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICOS.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.servico?.message} />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">
                Data e hora <span className="text-red-500">*</span>
              </label>
              <Input type="datetime-local" {...register('data_hora')} />
              <FieldError message={errors.data_hora?.message} />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs font-medium text-zinc-700 block mb-1">
              Observações
            </label>
            <textarea
              {...register('notas')}
              rows={3}
              placeholder="Detalhes adicionais sobre o serviço ou cliente..."
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 resize-none"
            />
          </div>

          {/* Submit error */}
          {formError && (
            <p className="text-sm text-red-500" role="alert">{formError}</p>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-700 hover:bg-blue-800 text-white w-full sm:w-auto"
            >
              {isSubmitting
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <UserPlus className="h-4 w-4 mr-2" />}
              {isSubmitting ? 'Salvando...' : 'Cadastrar cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
