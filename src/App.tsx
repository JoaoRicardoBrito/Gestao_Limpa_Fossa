import { Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AppointmentsPage } from '@/pages/AppointmentsPage'
import { TrucksPage } from '@/pages/TrucksPage'

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
          {/* Public route — /login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — wrapped by ProtectedRoute (redirects to /login if no session) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* / → redirect to /agendamentos (D-20) */}
              <Route index element={<Navigate to="/agendamentos" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/agendamentos" element={<AppointmentsPage />} />
              <Route path="/caminhoes" element={<TrucksPage />} />
            </Route>
          </Route>

          {/* Catch-all: redirect unknown paths to /agendamentos */}
          <Route path="*" element={<Navigate to="/agendamentos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
