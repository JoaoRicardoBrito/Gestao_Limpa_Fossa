import { useState, useEffect, useCallback } from 'react'
import { fetchTrucks, addTruck as addTruckService, deactivateTruck as deactivateTruckService } from '@/services/trucks'
import type { Truck } from '@/services/trucks'

export function useTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const { data } = await fetchTrucks()
    if (data) setTrucks(data)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const addTruck = useCallback(async (placa: string, modelo: string) => {
    const result = await addTruckService(placa, modelo)
    if (!result.error) await load()
    return result
  }, [load])

  const deactivateTruck = useCallback(async (id: string) => {
    const result = await deactivateTruckService(id)
    if (!result.error) setTrucks(prev => prev.filter(t => t.id !== id))
    return result
  }, [])

  return { trucks, isLoading, addTruck, deactivateTruck }
}
