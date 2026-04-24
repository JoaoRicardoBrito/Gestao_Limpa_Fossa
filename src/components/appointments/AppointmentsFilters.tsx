import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AppointmentsFiltersProps {
  search: string
  servico: string
  dateFrom: string
  dateTo: string
  serviceOptions: string[]
  onSearchChange: (v: string) => void
  onServicoChange: (v: string) => void
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
  onClear: () => void
}

export function AppointmentsFilters({
  search,
  servico,
  dateFrom,
  dateTo,
  serviceOptions,
  onSearchChange,
  onServicoChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: AppointmentsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome ou WhatsApp"
          aria-label="Buscar agendamentos"
          className="pl-8"
        />
      </div>

      {/* Service Select */}
      <Select
        value={servico || 'todos'}
        onValueChange={(v) => onServicoChange(v === 'todos' ? '' : v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos os serviços" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os serviços</SelectItem>
          {serviceOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date From */}
      <Input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        className="w-[160px]"
      />

      {/* Date To */}
      <Input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        className="w-[160px]"
      />

      {/* Clear button */}
      <Button variant="ghost" size="sm" onClick={onClear}>
        Limpar filtros
      </Button>
    </div>
  )
}
