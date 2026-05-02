import { supabase } from '@/lib/supabase'

/**
 * D-11/D-13: Total services per motorista is computed (not stored).
 * Returns Map<motorista_id, count> of concluido appointments.
 * Motoristas with zero concluido appointments will be absent from the map
 * (callers should default to 0).
 */
export async function fetchServiceCountsByMotorista(): Promise<{
  data: Map<string, number> | null
  error: string | null
}> {
  const { data, error } = await supabase
    .from('appointments')
    .select('motorista_id')
    .eq('status', 'concluido')
    .not('motorista_id', 'is', null)

  if (error) {
    return { data: null, error: 'Erro ao carregar contagem de serviços.' }
  }

  const counts = new Map<string, number>()
  for (const row of (data ?? []) as Array<{ motorista_id: string | null }>) {
    if (!row.motorista_id) continue
    counts.set(row.motorista_id, (counts.get(row.motorista_id) ?? 0) + 1)
  }
  return { data: counts, error: null }
}

/**
 * D-13: Same pattern for caminhão (keyed by caminhao_placa).
 */
export async function fetchServiceCountsByCaminhao(): Promise<{
  data: Map<string, number> | null
  error: string | null
}> {
  const { data, error } = await supabase
    .from('appointments')
    .select('caminhao_placa')
    .eq('status', 'concluido')
    .not('caminhao_placa', 'is', null)

  if (error) {
    return { data: null, error: 'Erro ao carregar contagem de serviços.' }
  }

  const counts = new Map<string, number>()
  for (const row of (data ?? []) as Array<{ caminhao_placa: string | null }>) {
    if (!row.caminhao_placa) continue
    counts.set(row.caminhao_placa, (counts.get(row.caminhao_placa) ?? 0) + 1)
  }
  return { data: counts, error: null }
}
