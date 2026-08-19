import { useCallback, useEffect, useState } from 'react'
import { ClipboardList, RefreshCw, ShieldCheck, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import { getTrainerDashboard } from '../../../services/trainerDashboardService'
import AssignedMembers from '../components/AssignedMembers'
import TrainerProfileCard from '../components/TrainerProfileCard'
import TrainerStatCard from '../components/TrainerStatCard'
import { Reveal, Stagger, staggerItem } from '../../member/dashboard/Motion'

export default function TrainerDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDashboard(await getTrainerDashboard())
    } catch (loadError) {
      setError(loadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const handleRecovery = async () => {
    if (error?.status === 401) {
      await logout()
      navigate('/login', { replace: true })
      return
    }
    loadDashboard()
  }

  if (loading) return <TrainerDashboardLoading />
  if (error) return <TrainerDashboardError error={error} onRetry={handleRecovery} />

  const trainer = dashboard.trainer || {}
  const members = dashboard.members || []
  const firstName = trainer.name?.split(' ')[0] || 'Trainer'

  return <div className="space-y-12 sm:space-y-16"><Reveal as="section" className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker text-ink/45">Trainer workspace</p><h1 className="mt-2 font-heading text-4xl uppercase leading-none tracking-wide text-ink sm:text-5xl">Good morning, {firstName}</h1><p className="mt-4 max-w-xl text-sm text-ink/60">Keep your roster moving forward with focused, consistent coaching.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/20 px-3 py-1.5 text-xs font-bold text-ink"><ShieldCheck size={14} />{trainer.status || 'Status unavailable'}</span></Reveal><Reveal as="section" className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white shadow-[0_24px_70px_rgba(18,18,18,0.16)] sm:p-8"><div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-accent/15 blur-3xl" /><div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">Your coaching roster</p><h2 className="mt-3 font-heading text-4xl uppercase tracking-wide sm:text-5xl">{dashboard.summary?.total_members ?? members.length} members assigned</h2><p className="mt-4 max-w-xl text-sm text-white/60">{trainer.specialization || 'Keep building strong member relationships through consistent coaching.'}</p></div><a href="#assigned-members" className="inline-flex w-fit items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-white"><ClipboardList size={16} /> View roster</a></div></Reveal><Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><TrainerStatCard icon={UsersRound} label="Assigned members" value={dashboard.summary?.total_members ?? members.length} detail="Your current roster" /><TrainerStatCard icon={ClipboardList} label="Active members" value={members.filter((member) => member.status === 'active').length} detail="Based on member status" /><TrainerStatCard icon={ShieldCheck} label="Members with membership" value={members.filter((member) => member.membership?.plan_name).length} detail="Based on current records" /></Stagger><AssignedMembers members={members} /><TrainerProfileCard trainer={trainer} /></div>
}

function TrainerDashboardLoading() {
  return <div className="space-y-8" aria-label="Loading Trainer workspace"><div className="h-28 animate-pulse rounded-2xl bg-ink/10" /><div className="h-56 animate-pulse rounded-2xl bg-ink/10" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-ink/10" />)}</div><div className="h-72 animate-pulse rounded-2xl bg-ink/10" /></div>
}

function TrainerDashboardError({ error, onRetry }) {
  const message = error.status === 401 ? 'Your session has expired. Please sign in again.' : error.status === 403 ? 'You do not have permission to access the Trainer workspace.' : error.status === 404 ? 'Your Trainer profile could not be found.' : error.isNetworkError ? 'Unable to connect to the server.' : 'We could not load the Trainer workspace right now.'
  const actionLabel = error.status === 401 ? 'Sign in again' : 'Try again'

  return <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center shadow-[0_16px_50px_rgba(18,18,18,0.04)]"><p className="section-kicker text-ink/45">Trainer workspace</p><h1 className="mt-3 font-heading text-3xl uppercase text-ink">Workspace unavailable</h1><p className="mx-auto mt-3 max-w-md text-sm text-ink/60">{message}</p><button type="button" onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-white"><RefreshCw size={16} /> {actionLabel}</button></div>
}
