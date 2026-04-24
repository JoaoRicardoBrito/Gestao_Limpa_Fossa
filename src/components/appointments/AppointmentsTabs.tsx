import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TabFilter } from '@/hooks/useAppointments'

interface Tab {
  value: TabFilter
  label: string
}

const TABS: Tab[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluídos' },
  { value: 'cancelado', label: 'Cancelados' },
]

interface AppointmentsTabsProps {
  activeTab: TabFilter
  onTabChange: (tab: TabFilter) => void
}

export function AppointmentsTabs({ activeTab, onTabChange }: AppointmentsTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as TabFilter)}
    >
      <TabsList className="bg-transparent border-b border-zinc-200 w-full justify-start rounded-none h-auto p-0 gap-0">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
