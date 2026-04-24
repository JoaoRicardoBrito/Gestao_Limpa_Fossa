import { supabase } from '@/lib/supabase'
import type { Appointment } from '@/types'

export interface FetchAppointmentsResult {
  data: Appointment[] | null
  error: string | null
}

export async function fetchAppointments(): Promise<FetchAppointmentsResult> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('data_hora', { ascending: true })

  if (error) {
    return { data: null, error: 'Erro ao carregar agendamentos.' }
  }
  return { data: data as Appointment[], error: null }
}
