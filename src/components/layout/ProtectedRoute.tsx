import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  // Show skeleton while Supabase SDK resolves session from localStorage (D-07)
  // In practice near-instant, but prevents flash of protected content on cold load
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse bg-zinc-200 rounded-lg h-[200px] w-full max-w-md" />
      </div>
    )
  }

  // No session → redirect to /login (D-06, AUTH-03)
  // Using replace so the protected route is NOT added to browser history
  if (!session) {
    return <Navigate to="/login" replace />
  }

  // Authenticated → render the nested route
  return <Outlet />
}
