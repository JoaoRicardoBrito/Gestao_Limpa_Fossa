import { useState, useEffect } from 'react'
import { Loader2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTrucks } from '@/hooks/useTrucks'
import { fetchServiceCountsByCaminhao } from '@/services/serviceCounts'

export function TrucksPage() {
  const { trucks, inactiveTrucks, isLoading, addTruck, deactivateTruck, reactivateTruck, deleteTruck } = useTrucks()
  const [placa, setPlaca] = useState('')
  const [modelo, setModelo] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [reactivatingId, setReactivatingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [counts, setCounts] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    let cancelled = false
    fetchServiceCountsByCaminhao().then(({ data }) => {
      if (cancelled || !data) return
      setCounts(data)
    })
    return () => { cancelled = true }
  }, [trucks.length, inactiveTrucks.length])

  const canSubmit = placa.trim().length >= 2 && modelo.trim().length >= 2

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setFormError(null)
    setIsSaving(true)
    const { error } = await addTruck(placa, modelo)
    setIsSaving(false)
    if (error) { setFormError(error); return }
    setPlaca('')
    setModelo('')
  }

  async function handleDeactivate(id: string) {
    setDeactivatingId(id)
    await deactivateTruck(id)
    setDeactivatingId(null)
  }

  async function handleReactivate(id: string) {
    setReactivatingId(id)
    await reactivateTruck(id)
    setReactivatingId(null)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteTruck(id)
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  return (
    <div className="p-4 xl:p-8 space-y-6 max-w-2xl">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Caminhões</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Gerencie os caminhões disponíveis para atendimento.
        </p>
      </div>

      {/* Add form */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900">Cadastrar caminhão</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          <Input
            value={placa}
            onChange={e => setPlaca(e.target.value)}
            placeholder="Placa (ex: ABC-1234)"
            aria-label="Placa do caminhão"
            className="flex-1"
            maxLength={10}
          />
          <Input
            value={modelo}
            onChange={e => setModelo(e.target.value)}
            placeholder="Modelo (ex: Mercedes 710)"
            aria-label="Modelo do caminhão"
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isSaving || !canSubmit}
            className="bg-blue-700 hover:bg-blue-800 text-white shrink-0"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
          </Button>
        </form>
        {formError && <p className="text-sm text-red-500" role="alert">{formError}</p>}
      </div>

      {/* Active trucks */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
          <h2 className="text-sm font-semibold text-zinc-900">Ativos</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : trucks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-400">
            <Truck className="h-8 w-8" />
            <p className="text-sm">Nenhum caminhão ativo.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">Placa</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">Modelo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">Serviços</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {trucks.map((truck) => (
                <tr key={truck.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-zinc-900">{truck.placa}</td>
                  <td className="px-4 py-3 text-sm text-zinc-700">{truck.modelo}</td>
                  <td className="px-4 py-3 text-sm text-zinc-700">{counts.get(truck.placa) ?? 0}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deactivatingId === truck.id}
                      onClick={() => handleDeactivate(truck.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      aria-label={`Desativar ${truck.placa}`}
                    >
                      {deactivatingId === truck.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Desativar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Inactive trucks */}
      {!isLoading && inactiveTrucks.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
            <h2 className="text-sm font-semibold text-zinc-500">Desativados</h2>
          </div>
          <table className="w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-400">Placa</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-400">Modelo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-400">Serviços</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {inactiveTrucks.map((truck) => (
                <tr key={truck.id} className="hover:bg-zinc-50 transition-colors opacity-60">
                  <td className="px-4 py-3 text-sm font-mono text-zinc-600">{truck.placa}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{truck.modelo}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{counts.get(truck.placa) ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={reactivatingId === truck.id || deletingId === truck.id}
                        onClick={() => handleReactivate(truck.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        aria-label={`Reativar ${truck.placa}`}
                      >
                        {reactivatingId === truck.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Reativar'}
                      </Button>

                      {confirmDeleteId === truck.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === truck.id}
                            onClick={() => handleDelete(truck.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
                          >
                            {deletingId === truck.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                          </Button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs text-zinc-400 hover:text-zinc-600 px-1"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={reactivatingId === truck.id}
                          onClick={() => setConfirmDeleteId(truck.id)}
                          className="text-zinc-400 hover:text-red-500 hover:bg-red-50"
                          aria-label={`Apagar ${truck.placa}`}
                        >
                          Apagar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
