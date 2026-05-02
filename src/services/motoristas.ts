import { supabase } from '@/lib/supabase'
import type { Motorista } from '@/types'

export type { Motorista }

export async function fetchMotoristas(): Promise<{ data: Motorista[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('motoristas')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  if (error) {
    return { data: null, error: 'Erro ao carregar motoristas.' }
  }
  return { data: data as Motorista[], error: null }
}

export async function addMotorista(
  nome: string,
  telefone: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('motoristas')
    .insert({ nome: nome.trim(), telefone: telefone.trim() })
  return { error: error ? 'Erro ao cadastrar motorista.' : null }
}

export async function deactivateMotorista(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('motoristas')
    .update({ ativo: false })
    .eq('id', id)
  return { error: error ? 'Erro ao desativar motorista.' : null }
}
