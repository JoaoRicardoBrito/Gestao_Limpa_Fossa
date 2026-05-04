import { useState, useEffect } from 'react'
import { Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMotoristas } from '@/hooks/useMotoristas'
import { fetchServiceCountsByMotorista } from '@/services/serviceCounts'

export function MotoristasPage() {
  const { motoristas, isLoading, addMotorista, deactivateMotorista } = useMotoristas()
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [counts, setCounts] = useState<Map<string, number>>(new Map())

  // Load service counts on mount and after motoristas list changes length
  useEffect(() => {
    let cancelled = false
    fetchServiceCountsByMotorista().then(({ data }) => {
      if (cancelled || !data) return
      setCounts(data)
    })
    return () => { cancelled = true }
  }, [motoristas.length])

  const phoneValid = /^\(?\d{2}\)?[\s\-]?\d{4,5}[\s\-]?\d{4}$/.test(telefone.trim())
  const canSubmit = nome.trim().length >= 2 && phoneValid

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setFormError(null)
    setIsSaving(true)
    const { error } = await addMotorista(nome, telefone)
    setIsSaving(false)
    if (error) { setFormError(error); return }
    setNome('')
    setTelefone('')
  }

  async function handleDeactivate(id: string) {
    setDeactivatingId(id)
    await deactivateMotorista(id)
    setDeactivatingId(null)
  }

  return (
    <div className="p-4 xl:p-8 space-y-6 max-w-2xl">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Motoristas</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Gerencie os motoristas disponíveis para atendimento.
        </p>
      </div>

      {/* Add form card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900">Cadastrar motorista</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          <Input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome completo"
            aria-label="Nome do motorista"
            className="flex-1"
          />
          <Input
            value={telefone}
            onChange={e => setTelefone(e.target.value)}
            placeholder="Telefone (ex: 86 99999-0000)"
            aria-label="Telefone do motorista"
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isSaving || !canSubmit}
            aria-label="Adicionar Motorista"
            className="bg-blue-700 hover:bg-blue-800 text-white shrink-0"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar Motorista'}
          </Button>
        </form>
        {formError && <p className="text-sm text-red-500" role="alert">{formError}</p>}
      </div>

      {/* Table card */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : motoristas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-400">
            <User className="h-8 w-8" />
            <p className="text-sm">Nenhum motorista cadastrado.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">Nome</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">Telefone</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">Serviços</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-500">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {motoristas.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-zinc-900">{m.nome}</td>
                  <td className="px-4 py-3 text-sm text-zinc-700">{m.telefone}</td>
                  <td className="px-4 py-3 text-sm text-zinc-700">{counts.get(m.id) ?? 0}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deactivatingId === m.id}
                      onClick={() => handleDeactivate(m.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      aria-label={`Desativar ${m.nome}`}
                    >
                      {deactivatingId === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Desativar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
