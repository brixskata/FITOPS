import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, ChevronDown, Menu, Moon, Search, Settings, UserRound } from 'lucide-react'
import { classNames } from '../../utils/helpers'
import useAuth from '../../hooks/useAuth'

const labels = {
  dashboard: 'Dashboard',
  members: 'Members',
  trainers: 'Trainers',
  'membership-plans': 'Membership Plans',
  memberships: 'Memberships',
  payments: 'Payments',
  attendance: 'Attendance',
  equipment: 'Equipment',
  maintenance: 'Maintenance',
  reports: 'Reports',
  settings: 'Settings',
}

export default function TopNavbar({ onMenuClick }) {
  const location = useLocation()
  const { user } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const currentKey = location.pathname.split('/').filter(Boolean).pop() || 'dashboard'
  const title = labels[currentKey] || 'Dashboard'
  const displayName = user?.name ?? 'Admin'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-[#f7f7f5]/90 backdrop-blur-xl">
      <div className="flex min-h-[84px] items-center gap-4 px-5 sm:px-8 lg:px-10">
        <button type="button" onClick={onMenuClick} className="rounded-xl p-2 text-ink/60 transition hover:bg-ink/5 hover:text-ink lg:hidden" aria-label="Open navigation">
          <Menu size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="hidden items-center gap-2 text-xs font-medium text-ink/40 sm:flex">
            <Link to="/admin/dashboard" className="transition hover:text-accent">Admin</Link>
            <span>/</span>
            <span>{title}</span>
          </div>
          <h1 className="truncate font-heading text-2xl uppercase tracking-wide text-ink sm:mt-1">{title}</h1>
        </div>

        <div className="hidden max-w-xs flex-1 lg:block">
          <label className="relative block">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 pl-11 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-accent" placeholder="Search workspace" aria-label="Search workspace" />
          </label>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" aria-label="Toggle dark mode" className="rounded-xl p-2.5 text-ink/55 transition hover:bg-ink/5 hover:text-ink"><Moon size={19} /></button>
          <button type="button" aria-label="Notifications" className="relative rounded-xl p-2.5 text-ink/55 transition hover:bg-ink/5 hover:text-ink"><Bell size={19} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" /></button>
          <div className="relative ml-1 border-l border-ink/10 pl-2 sm:ml-2 sm:pl-4">
            <button type="button" onClick={() => setUserMenuOpen((value) => !value)} className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-ink/5" aria-expanded={userMenuOpen}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-accent">{avatarInitial}</span>
              <span className="hidden text-left sm:block"><span className="block text-sm font-semibold">{displayName}</span><span className="block text-xs text-ink/40">Administrator</span></span>
              <ChevronDown size={16} className={classNames('hidden text-ink/45 transition sm:block', userMenuOpen && 'rotate-180')} />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-14 w-48 rounded-2xl border border-ink/10 bg-white p-2 shadow-xl">
                <Link to="/admin/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/70 transition hover:bg-ink/5 hover:text-ink"><UserRound size={16} /> Profile</Link>
                <Link to="/admin/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/70 transition hover:bg-ink/5 hover:text-ink"><Settings size={16} /> Settings</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
