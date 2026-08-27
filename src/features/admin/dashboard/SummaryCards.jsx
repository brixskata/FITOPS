import { Activity, CreditCard, UserCheck, Users, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from './dashboardUtils'

const cards = [
  { key: 'total_members', label: 'Total Members', icon: Users, to: '/admin/members', hint: 'All registered Members' },
  { key: 'active_members', label: 'Active Members', icon: UserCheck, to: '/admin/members', hint: 'Currently active' },
  { key: 'active_memberships', label: 'Active Memberships', icon: Activity, to: '/admin/memberships', hint: 'Current plans' },
  { key: 'today_attendance', label: "Today's Attendance", icon: Activity, to: '/admin/attendance', hint: 'Manila calendar day' },
  { key: 'currently_checked_in', label: 'Checked In Now', icon: UserCheck, to: '/admin/attendance', hint: 'Open sessions' },
  { key: 'paid_revenue', label: 'Paid Revenue', icon: Wallet, to: '/admin/payments', hint: 'Paid payments', currency: true },
]

export default function SummaryCards({ summary = {} }) {
  return <section aria-label="Dashboard summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{cards.map(({ key, label, icon: Icon, to, hint, currency }) => <Link key={key} to={to} className="group rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(18,18,18,0.05)] transition hover:-translate-y-1 hover:border-accent"><div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-ink"><Icon size={18} /></span><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">View</span></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</p><p className="mt-2 truncate text-2xl font-bold tracking-tight text-ink">{currency ? formatCurrency(summary[key]) : (summary[key] ?? 0)}</p><p className="mt-1 text-xs text-ink/40">{hint}</p></Link>)}</section>
}
