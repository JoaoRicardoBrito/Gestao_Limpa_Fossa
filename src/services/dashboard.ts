import { supabase } from '@/lib/supabase'
import type { Appointment } from '@/types'

export interface DashboardDataResult {
  data: Appointment[] | null
  error: string | null
}

export async function getDashboardData(): Promise<DashboardDataResult> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, status, data_hora, servico, valor, concluido_em, em_andamento_em, motorista_id, caminhao_placa')

  if (error) {
    return { data: null, error: 'Erro ao carregar dados do dashboard.' }
  }
  return { data: data as Appointment[], error: null }
}

export async function fetchMotoristasBasic(): Promise<{ id: string; nome: string }[]> {
  const { data } = await supabase.from('motoristas').select('id, nome')
  return (data ?? []) as { id: string; nome: string }[]
}
