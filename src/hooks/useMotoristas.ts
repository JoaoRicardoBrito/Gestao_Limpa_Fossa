import { useState, useEffect, useCallback } from 'react'
import {
  fetchMotoristas,
  addMotorista as addMotoristaService,
  deactivateMotorista as deactivateMotoristaService,
} from '@/services/motoristas'
import type { Motorista } from '@/services/motoristas'

export function useMotoristas() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const { data } = await fetchMotoristas()
    if (data) setMotoristas(data)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const addMotorista = useCallback(async (nome: string, telefone: string) => {
    const result = await addMotoristaService(nome, telefone)
    if (!result.error) await load()
    return result
  }, [load])

  const deactivateMotorista = useCallback(async (id: string) => {
    const result = await deactivateMotoristaService(id)
    if (!result.error) setMotoristas(prev => prev.filter(m => m.id !== id))
    return result
  }, [])

  return { motoristas, isLoading, addMotorista, deactivateMotorista }
}
