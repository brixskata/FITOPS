import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import Logo from '../common/Logo'
import { classNames } from '../../utils/helpers'

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Members', path: '/admin/members', icon: Users },
  { label: 'Trainers', path: '/admin/trainers', icon: UserRound },
  { label: 'Membership Plans', path: '/admin/membership-plans', icon: ShieldCheck },
  { label: 'Memberships', path: '/admin/memberships', icon: Dumbbell },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard },
  { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
  { label: 'Equipment', path: '/admin/equipment', icon: Dumbbell },
  { label: 'Maintenance', path: '/admin/maintenance', icon: Wrench },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
]

export default function Sidebar({ open, onClose, onLogoutRequest }) {
  const handleLogoutRequest = () => {
    onClose()
    onLogoutRequest()
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-ink px-5 py-6 text-white shadow-2xl transition-transform duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-3">
          <Logo className="text-3xl" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-ink">A</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Admin workspace</p>
            <p className="mt-0.5 text-xs text-white/45">FitOps management</p>
          </div>
        </div>

        <p className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">Workspace</p>
        <nav className="admin-scrollbar mt-3 flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Admin navigation">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => classNames(
                'group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                isActive
                  ? 'bg-accent/12 text-accent shadow-none hover:bg-accent/12 hover:text-accent'
                  : 'text-white/55 hover:bg-white/8 hover:text-white',
              )}
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={classNames(
                      'absolute inset-y-0 left-0 w-1 rounded-r-full transition-colors duration-200',
                      isActive ? 'bg-accent' : 'bg-transparent group-hover:bg-white/20',
                    )}
                  />
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className={isActive ? 'text-accent' : 'text-current'}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleLogoutRequest}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
