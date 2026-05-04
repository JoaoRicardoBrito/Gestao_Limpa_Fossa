import { supabase } from '@/lib/supabase'
import type { Appointment } from '@/types'

export interface DashboardDataResult {
  data: Appointment[] | null
  error: string | null
}

export async function getDashboardData(): Promise<DashboardDataResult> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, status, data_hora, servico, valor, concluido_em, em_andamento_em')

  if (error) {
    return { data: null, error: 'Erro ao carregar dados do dashboard.' }
  }
  return { data: data as Appointment[], error: null }
}
