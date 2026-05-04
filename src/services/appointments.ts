import { supabase } from '@/lib/supabase'
import type { Appointment, AppointmentStatus } from '@/types'

export interface FetchAppointmentsResult {
  data: Appointment[] | null
  error: string | null
}

export async function fetchAppointments(): Promise<FetchAppointmentsResult> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('data_hora', { ascending: true })
    .limit(500)

  if (error) {
    return { data: null, error: 'Erro ao carregar agendamentos.' }
  }
  return { data: data as Appointment[], error: null }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  motivo?: string,
  caminhao_placa?: string,
  motorista_id?: string
): Promise<{ error: string | null }> {
  const now = new Date().toISOString()
  const extra =
    status === 'concluido'
      ? { concluido_em: now }
      : status === 'cancelado'
        ? { cancelado_em: now, ...(motivo ? { motivo_cancelamento: motivo } : {}) }
        : status === 'em_andamento'
          ? {
              em_andamento_em: now,
              ...(caminhao_placa ? { caminhao_placa } : {}),
              ...(motorista_id ? { motorista_id } : {}),
            }
          : {}

  const { data: updated, error } = await supabase
    .from('appointments')
    .update({ status, atualizado_em: now, ...extra })
    .eq('id', id)
    .neq('status', 'concluido')
    .neq('status', 'cancelado')
    .select('id')

  if (error) return { error: 'Erro ao atualizar status.' }
  if (!updated || updated.length === 0) return { error: 'Status final não pode ser alterado.' }
  return { error: null }
}

export async function completeAppointment(
  id: string,
  valor: number
): Promise<{ error: string | null }> {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'concluido', concluido_em: now, valor, atualizado_em: now })
    .eq('id', id)
  return { error: error ? 'Erro ao concluir agendamento.' : null }
}

export async function createAppointment(payload: {
  nome: string
  whatsapp: string
  endereco: string
  servico: string
  data_hora: string
  notas?: string
}): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('appointments')
    .insert({
      nome: payload.nome.trim(),
      whatsapp: payload.whatsapp.trim(),
      endereco: payload.endereco.trim(),
      servico: payload.servico.trim(),
      data_hora: payload.data_hora,
      status: 'pendente',
      notas: payload.notas?.trim() || null,
    })
  return { error: error ? 'Erro ao cadastrar cliente.' : null }
}

export async function saveAppointmentNotes(
  id: string,
  notas: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('appointments')
    .update({ notas, atualizado_em: new Date().toISOString() })
    .eq('id', id)
  return { error: error ? 'Erro ao salvar nota.' : null }
}
