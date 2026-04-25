import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotesEditorProps {
  appointmentId: string
  initialNotes: string | null
  onSave: (id: string, notes: string) => Promise<{ error: string | null }>
}

export function NotesEditor({ appointmentId, initialNotes, onSave }: NotesEditorProps) {
  const [text, setText] = useState(initialNotes ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDirty = text !== (initialNotes ?? '')

  async function handleSave() {
    setError(null)
    setIsSaving(true)
    const { error } = await onSave(appointmentId, text)
    setIsSaving(false)
    if (error) { setError(error) }
  }

  return (
    <div className="space-y-1.5 pt-1">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Adicionar nota..."
        rows={3}
        className="w-full text-sm border border-zinc-200 rounded px-3 py-2 resize-none
                   text-zinc-700 placeholder:text-zinc-400 focus:outline-none
                   focus:ring-2 focus:ring-blue-700/30 focus:border-blue-700 transition-colors"
        aria-label="Nota do agendamento"
      />
      {error && (
        <p className="text-xs text-red-500" role="alert">{error}</p>
      )}
      <Button
        size="sm"
        disabled={isSaving || !isDirty}
        onClick={handleSave}
        className="bg-blue-700 hover:bg-blue-800 text-white"
      >
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          'Salvar nota'
        )}
      </Button>
    </div>
  )
}
