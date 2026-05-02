import { useState, useEffect, useCallback } from 'react'
import {
  fetchTrucks,
  fetchInactiveTrucks,
  addTruck as addTruckService,
  deactivateTruck as deactivateTruckService,
  reactivateTruck as reactivateTruckService,
  deleteTruck as deleteTruckService,
} from '@/services/trucks'
import type { Truck } from '@/services/trucks'

export function useTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [inactiveTrucks, setInactiveTrucks] = useState<Truck[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const [active, inactive] = await Promise.all([fetchTrucks(), fetchInactiveTrucks()])
    if (active.data) setTrucks(active.data)
    if (inactive.data) setInactiveTrucks(inactive.data)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const addTruck = useCallback(async (placa: string, modelo: string) => {
    const result = await addTruckService(placa, modelo)
    if (!result.error) await load()
    return result
  }, [load])

  const deactivateTruck = useCallback(async (id: string) => {
    const truck = trucks.find(t => t.id === id)
    const result = await deactivateTruckService(id)
    if (!result.error) {
      setTrucks(prev => prev.filter(t => t.id !== id))
      if (truck) setInactiveTrucks(prev => [...prev, { ...truck, ativo: false }].sort((a, b) => a.placa.localeCompare(b.placa)))
    }
    return result
  }, [trucks])

  const reactivateTruck = useCallback(async (id: string) => {
    const truck = inactiveTrucks.find(t => t.id === id)
    const result = await reactivateTruckService(id)
    if (!result.error) {
      setInactiveTrucks(prev => prev.filter(t => t.id !== id))
      if (truck) setTrucks(prev => [...prev, { ...truck, ativo: true }].sort((a, b) => a.placa.localeCompare(b.placa)))
    }
    return result
  }, [inactiveTrucks])

  const deleteTruck = useCallback(async (id: string) => {
    const result = await deleteTruckService(id)
    if (!result.error) setInactiveTrucks(prev => prev.filter(t => t.id !== id))
    return result
  }, [])

  return { trucks, inactiveTrucks, isLoading, addTruck, deactivateTruck, reactivateTruck, deleteTruck }
}
