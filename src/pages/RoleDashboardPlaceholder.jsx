import { Link } from 'react-router-dom'
import Button from '../components/common/Button'
import Logo from '../components/common/Logo'
import useAuth from '../hooks/useAuth'

export default function RoleDashboardPlaceholder({ title, role }) {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-white">
      <section className="w-full max-w-lg border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30">
        <Logo className="justify-center text-3xl" />
        <p className="section-kicker mt-10">{role} area</p>
        <h1 className="section-heading mt-4">{title}</h1>
        <p className="mt-6 text-sm leading-6 text-white/60">
          Authentication is connected. This dashboard route is ready for its future module.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button to="/" className="w-full sm:w-auto">Home</Button>
          <Button type="button" onClick={handleLogout} className="w-full bg-white text-ink hover:bg-accent sm:w-auto">
            Logout
          </Button>
        </div>
        <Link to="/login" className="mt-6 block text-sm text-white/45 hover:text-accent">
          Back to login
        </Link>
      </section>
    </main>
  )
}
