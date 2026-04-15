import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { ProtectedRoute } from './ProtectedRoute'

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminInner>{children}</AdminInner>
    </ProtectedRoute>
  )
}

function AdminInner({ children }: { children: ReactNode }) {
  const role = useAppSelector((s) => s.auth.user?.role)
  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }
  return children
}
