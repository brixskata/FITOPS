import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getMemberDashboard } from '../../../services/memberDashboardService'
import Achievements from '../dashboard/Achievements'
import HeroCard from '../dashboard/HeroCard'
import MembershipSummary from '../dashboard/MembershipSummary'
import MotivationBanner from '../dashboard/MotivationBanner'
import ProgressCards from '../dashboard/ProgressCards'
import QuickActions from '../dashboard/QuickActions'
import RecentActivity from '../dashboard/RecentActivity'
import UpcomingWorkout from '../dashboard/UpcomingWorkout'
import { Reveal } from '../dashboard/Motion'

export default function MemberDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDashboard(await getMemberDashboard())
    } catch (loadError) {
      setError(loadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  if (loading) return <DashboardLoading />
  if (error) return <DashboardError error={error} onRetry={loadDashboard} />

  const { profile, membership, attendance, achievements, activity, schedule, payments } = dashboard
  const latestPayment = payments?.[0]

  return <div className="space-y-12 sm:space-y-16">
    <Reveal as="section" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker text-ink/45">Member home</p><h1 className="mt-2 font-heading text-4xl uppercase leading-none tracking-wide text-ink sm:text-5xl">Good morning, {profile.name?.split(' ')[0] || 'there'}</h1><p className="mt-4 text-sm text-ink/60">Stay consistent. Every workout counts.</p></div><p className="hidden text-right text-xs font-semibold uppercase tracking-[0.16em] text-ink/45 sm:block">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}</p></Reveal>
    <HeroCard membership={membership} />
    <QuickActions />
    <ProgressCards attendance={attendance} />
    <Achievements achievements={achievements} />
    <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]"><RecentActivity activity={activity} /><UpcomingWorkout schedule={schedule} /></div>
    <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]"><MembershipSummary membership={membership} payment={latestPayment} /><MotivationBanner /></div>
  </div>
}

function DashboardLoading() {
  return <div className="space-y-8" aria-label="Loading member dashboard"><div className="h-28 animate-pulse rounded-2xl bg-ink/10" /><div className="h-64 animate-pulse rounded-2xl bg-ink/10" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-ink/10" />)}</div></div>
}

function DashboardError({ error, onRetry }) {
  const message = error.status === 404 ? 'Your member profile is not available yet.' : error.isNetworkError ? 'Unable to connect to the server.' : 'We could not load your dashboard right now.'
  return <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center shadow-[0_16px_50px_rgba(18,18,18,0.04)]"><p className="section-kicker text-ink/45">Member home</p><h1 className="mt-3 font-heading text-3xl uppercase text-ink">Dashboard unavailable</h1><p className="mx-auto mt-3 max-w-md text-sm text-ink/60">{message}</p><button type="button" onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-white"><RefreshCw size={16} /> Try again</button></div>
}
