import { RefreshCw } from 'lucide-react'

export default function DashboardErrorState({ error, onRetry }) {
  const message = error?.status === 401 ? 'Your session has expired. Please sign in again.' : error?.status === 403 ? 'You do not have permission to view the Admin Dashboard.' : error?.status === 429 ? 'Too many requests. Please try again shortly.' : error?.isNetworkError ? 'Unable to connect to FitOps. Check your connection and try again.' : 'We could not load the Admin Dashboard right now.'

  return <div role="alert" className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-12 text-center"><p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-800/60">Admin Dashboard</p><h2 className="mt-3 font-heading text-3xl uppercase tracking-wide text-amber-950">Dashboard unavailable</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-amber-900/70">{message}</p><button type="button" onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-wider text-accent transition hover:-translate-y-0.5"><RefreshCw size={15} /> Retry</button></div>
}
