import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Route guard: requires an Admin user. Guests go to /auth; signed-in
// non-admins are bounced to the Home page.
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/auth" replace />
  if (user.role !== 'Admin') return <Navigate to="/" replace />
  return <>{children}</>
}
