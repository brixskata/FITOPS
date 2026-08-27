import { Dumbbell } from 'lucide-react'
import { humanize } from './dashboardUtils'

const statuses = ['active', 'expired', 'cancelled']

export default function MembershipStatistics({ statistics = {} }) {
  const total = statuses.reduce((sum, status) => sum + Number(statistics[status] ?? 0), 0)
  return <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:p-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent"><Dumbbell size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">Memberships</p><h2 className="mt-1 font-heading text-2xl uppercase text-ink">Plan status</h2></div></div><div className="mt-7 space-y-5">{statuses.map((status) => { const count = Number(statistics[status] ?? 0); const width = total ? `${Math.round((count / total) * 100)}%` : '0%'; return <div key={status}><div className="flex items-center justify-between text-sm"><span className="font-semibold text-ink">{humanize(status)}</span><span className="font-bold text-ink">{count}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/5"><div className={`h-full rounded-full ${status === 'active' ? 'bg-accent' : status === 'expired' ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width }} /></div></div> })}</div><p className="mt-6 text-xs text-ink/40">Counts come from the current Membership records.</p></section>
}
