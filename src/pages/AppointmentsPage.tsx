import { useState } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { AppointmentsTabs } from '@/components/appointments/AppointmentsTabs'
import { AppointmentsFilters } from '@/components/appointments/AppointmentsFilters'
import { AppointmentsTable } from '@/components/appointments/AppointmentsTable'
import { AppointmentCard } from '@/components/appointments/AppointmentCard'
import { SkeletonTable } from '@/components/appointments/SkeletonTable'
import { SkeletonCard } from '@/components/appointments/SkeletonCard'
import { EmptyState } from '@/components/appointments/EmptyState'

export function AppointmentsPage() {
  const [clearKey, setClearKey] = useState(0)
  const {
    filteredData,
    serviceOptions,
    isLoading,
    error,
    filters,
    setFilters,
    updateStatus,
    saveNotes,
  } = useAppointments()

  const hasActiveFilters =
    filters.search !== '' ||
    filters.servico !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== ''

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">Agendamentos</h1>

      <AppointmentsFilters
        clearKey={clearKey}
        search={filters.search}
        servico={filters.servico}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        serviceOptions={serviceOptions}
        onSearchChange={v => setFilters(prev => ({ ...prev, search: v }))}
        onServicoChange={v => setFilters(prev => ({ ...prev, servico: v }))}
        onDateFromChange={v => setFilters(prev => ({ ...prev, dateFrom: v }))}
        onDateToChange={v => setFilters(prev => ({ ...prev, dateTo: v }))}
        onClear={() => {
          setFilters(prev => ({
            ...prev,
            search: '',
            servico: '',
            dateFrom: '',
            dateTo: '',
          }))
          setClearKey(k => k + 1)
        }}
      />

      <AppointmentsTabs
        activeTab={filters.tab}
        onTabChange={tab => setFilters(prev => ({ ...prev, tab }))}
      />

      {isLoading && (
        <>
          <div className="hidden xl:block">
            <SkeletonTable />
          </div>
          <div className="xl:hidden">
            <SkeletonCard />
          </div>
        </>
      )}

      {!isLoading && error && (
        <div className="mt-8 text-center">
          <p className="text-sm font-semibold text-red-600">
            Erro ao carregar agendamentos
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            Não foi possível buscar os dados. Recarregue a página ou tente novamente.
          </p>
          <button
            className="mt-3 text-sm text-blue-700 underline"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !error && filteredData.length === 0 && (
        <EmptyState hasFilters={hasActiveFilters || filters.tab !== 'todos'} />
      )}

      {!isLoading && !error && filteredData.length > 0 && (
        <>
          <div className="hidden xl:block mt-4">
            <AppointmentsTable data={filteredData} onStatusChange={updateStatus} onSaveNotes={saveNotes} />
          </div>
          <div className="xl:hidden flex flex-col gap-3 mt-4">
            {filteredData.map(a => (
              <AppointmentCard key={a.id} appointment={a} onStatusChange={updateStatus} onSaveNotes={saveNotes} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
