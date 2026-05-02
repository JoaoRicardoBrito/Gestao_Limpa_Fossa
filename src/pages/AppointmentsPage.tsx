import { useState, useMemo, useCallback } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { useMotoristas } from '@/hooks/useMotoristas'
import { AppointmentsTabs } from '@/components/appointments/AppointmentsTabs'
import { AppointmentsFilters } from '@/components/appointments/AppointmentsFilters'
import { AppointmentsTable } from '@/components/appointments/AppointmentsTable'
import { AppointmentCard } from '@/components/appointments/AppointmentCard'
import { SkeletonTable } from '@/components/appointments/SkeletonTable'
import { SkeletonCard } from '@/components/appointments/SkeletonCard'
import { EmptyState } from '@/components/appointments/EmptyState'
import { StartTaskDialog } from '@/components/appointments/StartTaskDialog'
import { CompleteTaskDialog } from '@/components/appointments/CompleteTaskDialog'
import { completeAppointment } from '@/services/appointments'

export function AppointmentsPage() {
  const [clearKey, setClearKey] = useState(0)
  const [startDialogId, setStartDialogId] = useState<string | null>(null)
  const [completeDialogId, setCompleteDialogId] = useState<string | null>(null)
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

  const { motoristas } = useMotoristas()
  const motoristaNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of motoristas) map.set(m.id, m.nome)
    return map
  }, [motoristas])
  const getMotoristaName = useCallback(
    (id: string | null) => (id ? motoristaNameById.get(id) ?? null : null),
    [motoristaNameById]
  )

  const hasActiveFilters =
    filters.search !== '' ||
    filters.servico !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== ''

  const startDialogAppointment = startDialogId
    ? filteredData.find(a => a.id === startDialogId) ?? null
    : null
  const completeDialogAppointment = completeDialogId
    ? filteredData.find(a => a.id === completeDialogId) ?? null
    : null

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
            <AppointmentsTable
              data={filteredData}
              onStatusChange={updateStatus}
              onSaveNotes={saveNotes}
              onStartRequest={(id) => setStartDialogId(id)}
              onCompleteRequest={(id) => setCompleteDialogId(id)}
              getMotoristaName={getMotoristaName}
            />
          </div>
          <div className="xl:hidden flex flex-col gap-3 mt-4">
            {filteredData.map(a => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                onStatusChange={updateStatus}
                onSaveNotes={saveNotes}
                onStartRequest={() => setStartDialogId(a.id)}
                onCompleteRequest={() => setCompleteDialogId(a.id)}
                getMotoristaName={getMotoristaName}
              />
            ))}
          </div>
        </>
      )}

      {startDialogAppointment && (
        <StartTaskDialog
          open={startDialogId !== null}
          onOpenChange={(open) => { if (!open) setStartDialogId(null) }}
          appointment={startDialogAppointment}
          onConfirm={async (caminhao_placa, motorista_id) => {
            return updateStatus(startDialogAppointment.id, 'em_andamento', undefined, caminhao_placa, motorista_id)
          }}
        />
      )}

      {completeDialogAppointment && (
        <CompleteTaskDialog
          open={completeDialogId !== null}
          onOpenChange={(open) => { if (!open) setCompleteDialogId(null) }}
          appointmentName={completeDialogAppointment.nome}
          onConfirm={async (valor) => {
            const { error } = await completeAppointment(completeDialogAppointment.id, valor)
            if (!error) {
              await updateStatus(completeDialogAppointment.id, 'concluido')
            }
            setCompleteDialogId(null)
            return { error }
          }}
        />
      )}
    </div>
  )
}
