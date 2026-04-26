import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, LogOut, Truck } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import logo from '@/assets/WhatsApp Image 2026-04-10 at 12.13.48.jpeg'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Agendamentos', icon: CalendarDays, href: '/agendamentos' },
  { label: 'Caminhões', icon: Truck, href: '/caminhoes' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-[240px] flex flex-col bg-white border-r border-zinc-200 z-30">
      {/* Header: logo */}
      <div className="h-14 flex items-center px-4 shrink-0">
        <img src={logo} alt="Santa Clara ECO" className="h-8 w-auto object-contain" />
      </div>

      <Separator />

      {/* Nav items — flex-grow fills available space */}
      <nav
        className="flex-1 flex flex-col py-2 overflow-y-auto"
        aria-label="Navegação principal"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'h-11 px-4 flex items-center gap-2 text-sm w-full text-left transition-colors',
                isActive
                  ? 'border-l-[3px] border-zinc-900 text-zinc-900 font-semibold bg-zinc-50'
                  : 'border-l-[3px] border-transparent text-zinc-700 hover:bg-zinc-100'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <Separator />

      {/* Footer: logout button (D-19) */}
      <div className="shrink-0 p-2">
        <button
          onClick={handleSignOut}
          className="h-11 w-full px-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-red-500 transition-colors rounded"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
