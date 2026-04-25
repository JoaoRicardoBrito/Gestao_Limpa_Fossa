import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard, CalendarDays, LogOut } from 'lucide-react'
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
]

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()

  const closeDrawer = () => setIsOpen(false)

  // D-18: Nav item tap → close drawer THEN navigate (sequence matters)
  const handleNavigation = (href: string) => {
    closeDrawer()
    // Small timeout allows the close animation to begin before route change
    setTimeout(() => navigate(href), 50)
  }

  const handleSignOut = async () => {
    closeDrawer()
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Fixed header bar */}
      <header className="fixed top-0 inset-x-0 h-14 bg-white border-b border-zinc-200 flex items-center z-30 px-2">
        {/* Hamburger button — 44x44 touch target */}
        <button
          onClick={() => setIsOpen(true)}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          className="h-11 w-11 flex items-center justify-center text-zinc-700 rounded"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Center: logo */}
        <div className="flex-1 flex justify-center">
          <img src={logo} alt="Santa Clara ECO" className="h-8 w-auto object-contain" />
        </div>

        {/* Right: reserved — empty in Phase 1 */}
        <div className="h-11 w-11" />
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop — opacity 0→0.4 in 250ms easeOut, 0.4→0 in 200ms easeIn */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4, transition: { duration: 0.25, ease: 'easeOut' } }}
              exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
              className="fixed inset-0 bg-black z-40"
              onClick={closeDrawer}
              aria-hidden="true"
            />

            {/* Drawer panel — x -280→0 in 250ms easeOut, 0→-280 in 200ms easeIn */}
            <motion.div
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{
                duration: 0.25,
                ease: 'easeOut',
              }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 flex flex-col"
            >
              {/* Drawer header with close button */}
              <div className="h-14 flex items-center justify-between px-4 shrink-0">
                <img src={logo} alt="Santa Clara ECO" className="h-8 w-auto object-contain" />
                {/* X close button — 44x44 touch target */}
                <button
                  onClick={closeDrawer}
                  aria-label="Fechar menu"
                  className="h-11 w-11 flex items-center justify-center text-zinc-700 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <Separator />

              {/* Nav items */}
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
                      onClick={() => handleNavigation(item.href)}
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

              {/* Logout */}
              <div className="shrink-0 p-2">
                <button
                  onClick={handleSignOut}
                  className="h-11 w-full px-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-red-500 transition-colors rounded"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Sair
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
