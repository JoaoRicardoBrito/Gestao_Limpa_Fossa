import { useEffect, useState, useMemo, useCallback } from 'react'
import { fetchAppointments, updateAppointmentStatus } from '@/services/appointments'
import type { Appointment, AppointmentStatus } from '@/types'

export type TabFilter = AppointmentStatus | 'todos'

export interface FilterState {
  tab: TabFilter
  search: string
  servico: string
  dateFrom: string
  dateTo: string
}

export function useAppointments() {
  const [rawData, setRawData] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    tab: 'todos',
    search: '',
    servico: '',
    dateFrom: '',
    dateTo: '',
  })

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchAppointments().then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        setError(error)
        setIsLoading(false)
        return
      }
      setRawData(data ?? [])
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredData = useMemo(() => {
    return rawData
      .filter(a => filters.tab === 'todos' || a.status === filters.tab)
      .filter(a => {
        if (!filters.search.trim()) return true
        const q = filters.search.toLowerCase()
        return a.nome.toLowerCase().includes(q) || a.whatsapp.includes(q)
      })
      .filter(a => !filters.servico || a.servico === filters.servico)
      .filter(a =>
        !filters.dateFrom ||
        new Date(a.data_hora) >= new Date(filters.dateFrom)
      )
      .filter(a =>
        !filters.dateTo ||
        new Date(a.data_hora) <= new Date(filters.dateTo + 'T23:59:59')
      )
  }, [rawData, filters])

  const serviceOptions = useMemo(
    () => [...new Set(rawData.map(a => a.servico))].sort(),
    [rawData]
  )

  const updateStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    // Optimistic update
    setRawData(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    const { error } = await updateAppointmentStatus(id, status)
    if (error) {
      // Revert on failure by refetching
      fetchAppointments().then(({ data }) => {
        if (data) setRawData(data)
      })
    }
  }, [])

  return {
    filteredData,
    serviceOptions,
    isLoading,
    error,
    filters,
    setFilters,
    updateStatus,
  }
}
