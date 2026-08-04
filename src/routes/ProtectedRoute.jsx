import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Loader from '../components/common/Loader'
import useAuth from '../hooks/useAuth'
import { getRoleRedirectPath } from '../services/authService'

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation()
  const { isAuthenticated, loading, role } = useAuth()

  if (loading) {
    return (
      <main className="min-h-screen bg-ink text-white">
        <Loader />
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to={getRoleRedirectPath(role)} replace />
  }

  return <Outlet />
}
