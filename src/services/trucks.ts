import { supabase } from '@/lib/supabase'

export interface Truck {
  id: string
  placa: string
  modelo: string
  ativo: boolean
  criado_em: string
}

export async function fetchTrucks(): Promise<{ data: Truck[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('trucks')
    .select('*')
    .eq('ativo', true)
    .order('placa', { ascending: true })

  if (error) {
    return { data: null, error: 'Erro ao carregar caminhões.' }
  }
  return { data: data as Truck[], error: null }
}

export async function addTruck(
  placa: string,
  modelo: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('trucks')
    .insert({ placa: placa.trim().toUpperCase(), modelo: modelo.trim() })
  return { error: error ? 'Erro ao cadastrar caminhão.' : null }
}

export async function deactivateTruck(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('trucks')
    .update({ ativo: false })
    .eq('id', id)
  return { error: error ? 'Erro ao desativar caminhão.' : null }
}
