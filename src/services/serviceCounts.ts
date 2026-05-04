import { supabase } from '@/lib/supabase'

// ─── Module-level cache (PERF-04) ─────────────────────────────────────────
// serviceCounts is called by TrucksPage and MotoristasPage independently.
// A 5-minute TTL avoids redundant full-table scans on every page visit.

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> { data: T; ts: number }
let motoristaCache: CacheEntry<Map<string, number>> | null = null
let caminhaoCache:  CacheEntry<Map<string, number>> | null = null

function isFresh<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return entry !== null && Date.now() - entry.ts < CACHE_TTL
}

export function invalidateServiceCountsCache() {
  motoristaCache = null
  caminhaoCache  = null
}

// ─── Queries ───────────────────────────────────────────────────────────────

/**
 * D-11/D-13: Total services per motorista (computed from appointments).
 * Returns Map<motorista_id, count> of concluido appointments.
 * Absent keys default to 0 at call sites.
 */
export async function fetchServiceCountsByMotorista(): Promise<{
  data: Map<string, number> | null
  error: string | null
}> {
  if (isFresh(motoristaCache)) return { data: motoristaCache.data, error: null }

  const { data, error } = await supabase
    .from('appointments')
    .select('motorista_id')
    .eq('status', 'concluido')
    .not('motorista_id', 'is', null)

  if (error) return { data: null, error: 'Erro ao carregar contagem de serviços.' }

  const counts = new Map<string, number>()
  for (const row of (data ?? []) as Array<{ motorista_id: string | null }>) {
    if (!row.motorista_id) continue
    counts.set(row.motorista_id, (counts.get(row.motorista_id) ?? 0) + 1)
  }

  motoristaCache = { data: counts, ts: Date.now() }
  return { data: counts, error: null }
}

/**
 * D-13: Same pattern for caminhão (keyed by caminhao_placa).
 */
export async function fetchServiceCountsByCaminhao(): Promise<{
  data: Map<string, number> | null
  error: string | null
}> {
  if (isFresh(caminhaoCache)) return { data: caminhaoCache.data, error: null }

  const { data, error } = await supabase
    .from('appointments')
    .select('caminhao_placa')
    .eq('status', 'concluido')
    .not('caminhao_placa', 'is', null)

  if (error) return { data: null, error: 'Erro ao carregar contagem de serviços.' }

  const counts = new Map<string, number>()
  for (const row of (data ?? []) as Array<{ caminhao_placa: string | null }>) {
    if (!row.caminhao_placa) continue
    counts.set(row.caminhao_placa, (counts.get(row.caminhao_placa) ?? 0) + 1)
  }

  caminhaoCache = { data: counts, ts: Date.now() }
  return { data: counts, error: null }
}
