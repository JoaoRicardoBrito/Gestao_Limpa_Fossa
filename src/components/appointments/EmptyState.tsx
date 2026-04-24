interface EmptyStateProps {
  hasFilters?: boolean
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  if (hasFilters === false) {
    return (
      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-500">
          Ainda não há agendamentos cadastrados.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 text-center">
      <h3 className="text-sm font-semibold text-zinc-700">
        Nenhum agendamento encontrado
      </h3>
      <p className="text-sm text-zinc-500">
        Tente ajustar os filtros ou a busca para ver resultados.
      </p>
    </div>
  )
}
