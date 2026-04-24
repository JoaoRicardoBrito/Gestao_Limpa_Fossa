import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Desktop sidebar — visible at 1280px+ (xl breakpoint) */}
      <div className="hidden xl:block">
        <Sidebar />
      </div>

      {/* Mobile header — visible below 1280px */}
      <div className="xl:hidden">
        <MobileHeader />
      </div>

      {/* Main content area */}
      {/* Desktop: margin-left 240px to clear sidebar; Mobile: padding-top 56px for fixed header */}
      <main className="xl:ml-[240px] pt-14 xl:pt-0 min-h-screen">
        <div className="p-4 xl:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
