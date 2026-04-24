import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AppointmentsPage } from '@/pages/AppointmentsPage'

export function App() {
  return (
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
            </Route>
          </Route>

          {/* Catch-all: redirect unknown paths to /agendamentos */}
          <Route path="*" element={<Navigate to="/agendamentos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
