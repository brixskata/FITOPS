import { useState } from 'react'
import { Bell, ChevronDown, Menu, Settings, UserRound, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { classNames } from '../../../utils/helpers'
import useAuth from '../../../hooks/useAuth'

const navigation = [
  { label: 'Home', path: '/member/dashboard', key: 'dashboard' },
  { label: 'My Membership', path: '/member/membership', key: 'membership' },
  { label: 'Attendance', path: '/member/attendance', key: 'attendance' },
  { label: 'Payments', path: '/member/payments', key: 'payments' },
  { label: 'Profile', path: '/member/profile', key: 'profile' },
]

export default function MemberTopbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const name = user?.name || 'Member'

  const handleLogout = async () => { await logout(); setMenuOpen(false); navigate('/login', { replace: true }) }

  const closeMobile = () => setMobileOpen(false)

  return <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="fixed inset-x-0 top-0 z-30 border-b border-ink/10 bg-white/95 backdrop-blur-xl">
    <div className="mx-auto flex min-h-[84px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
      <Link to="/member/dashboard" onClick={closeMobile} className="heading text-3xl uppercase tracking-tight text-ink">FIT<span className="text-accent">OPS</span></Link>
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Member navigation">{navigation.map(({ label, path, key }) => { const active = location.pathname.includes(key); return <Link key={path} to={path} className={classNames('relative py-2 text-sm font-semibold transition hover:text-ink', active ? 'text-ink' : 'text-ink/55')}>{label}{active && <motion.span layoutId="member-nav-underline" className="absolute inset-x-0 -bottom-1 h-0.5 bg-accent" transition={{ duration: 0.3 }} />}</Link> })}</nav>
      <div className="flex items-center gap-1 sm:gap-2"><motion.button type="button" aria-label="Notifications" whileHover={{ rotate: [0, -7, 7, -3, 0] }} transition={{ duration: 0.45 }} className="relative rounded-xl p-2.5 text-ink/55 hover:bg-ink/5 hover:text-ink"><Bell size={19} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" /></motion.button><div className="relative ml-1 border-l border-ink/10 pl-2 sm:ml-2 sm:pl-4"><motion.button type="button" onClick={() => setMenuOpen((value) => !value)} whileHover={{ scale: 1.05, boxShadow: '0 0 0 4px rgba(255,230,0,0.18)' }} transition={{ duration: 0.25 }} className="flex items-center gap-2 rounded-xl p-1.5" aria-expanded={menuOpen}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-accent">ME</span><span className="hidden text-left sm:block"><span className="block text-sm font-semibold">{name}</span><span className="block text-xs text-ink/40">Member</span></span><ChevronDown size={16} className={classNames('hidden text-ink/45 transition sm:block', menuOpen && 'rotate-180')} /></motion.button>{menuOpen && <div className="absolute right-0 top-14 w-48 rounded-2xl border border-ink/10 bg-white p-2 shadow-xl"><Link to="/member/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/70 transition hover:bg-ink/5 hover:text-ink"><UserRound size={16} /> My Profile</Link><Link to="/member/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/70 transition hover:bg-ink/5 hover:text-ink"><Settings size={16} /> Settings</Link><button type="button" onClick={handleLogout} className="mt-1 block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-accent/10">Logout</button></div>}</div><button type="button" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} className="rounded-xl p-2.5 text-ink/60 transition hover:bg-ink/5 lg:hidden">{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div>
    {mobileOpen && <nav className="border-t border-ink/10 bg-white px-5 py-4 lg:hidden" aria-label="Mobile member navigation">{navigation.map(({ label, path }) => <Link key={path} to={path} onClick={closeMobile} className="block rounded-xl px-3 py-3 text-sm font-semibold text-ink/60 transition hover:bg-accent/10 hover:text-ink">{label}</Link>)}</nav>}
  </motion.header>
}
