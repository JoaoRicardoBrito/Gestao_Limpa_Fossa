import { Component, lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Skeleton } from '@/components/ui/skeleton'

// Eager — tiny, first interaction
import { LoginPage } from '@/pages/LoginPage'

// Lazy — loaded only when the user navigates to that route
const DashboardPage       = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AppointmentsPage    = lazy(() => import('@/pages/AppointmentsPage').then(m => ({ default: m.AppointmentsPage })))
const TrucksPage          = lazy(() => import('@/pages/TrucksPage').then(m => ({ default: m.TrucksPage })))
const MotoristasPage      = lazy(() => import('@/pages/MotoristasPage').then(m => ({ default: m.MotoristasPage })))
const CadastrarClientePage = lazy(() => import('@/pages/CadastrarClientePage').then(m => ({ default: m.CadastrarClientePage })))

function PageFallback() {
  return (
    <div className="p-4 xl:p-8 space-y-4">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-8 max-w-sm w-full text-center">
            <p className="text-sm font-semibold text-zinc-900">Algo deu errado</p>
            <p className="text-xs text-zinc-500 mt-1">Recarregue a página para tentar novamente.</p>
            <button
              className="mt-4 text-xs text-blue-700 underline"
              onClick={() => window.location.reload()}
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/agendamentos" replace />} />
                <Route path="/dashboard" element={
                  <Suspense fallback={<PageFallback />}><DashboardPage /></Suspense>
                } />
                <Route path="/agendamentos" element={
                  <Suspense fallback={<PageFallback />}><AppointmentsPage /></Suspense>
                } />
                <Route path="/caminhoes" element={
                  <Suspense fallback={<PageFallback />}><TrucksPage /></Suspense>
                } />
                <Route path="/motoristas" element={
                  <Suspense fallback={<PageFallback />}><MotoristasPage /></Suspense>
                } />
                <Route path="/cadastrar-cliente" element={
                  <Suspense fallback={<PageFallback />}><CadastrarClientePage /></Suspense>
                } />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/agendamentos" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
