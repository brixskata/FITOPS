import { Navigate, Outlet } from 'react-router-dom'
import Loader from '../components/common/Loader'
import useAuth from '../hooks/useAuth'

export default function GuestRoute() {
  const { isAuthenticated, getRedirectPath, loading } = useAuth()

  if (loading) {
    return (
      <main className="min-h-screen bg-ink text-white">
        <Loader />
      </main>
    )
  }

  return isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <Outlet />
}
