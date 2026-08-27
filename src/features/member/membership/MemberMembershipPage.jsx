import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, CreditCard, RefreshCw, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCurrentMembership, getMemberMembershipErrorMessage, listMemberMemberships, showMemberMembership } from '../../../services/memberMembershipService'
import { PageIntro } from '../components/MemberUI'
import MembershipDetails from './MembershipDetails'
import MembershipHistory from './MembershipHistory'
import LoadingSkeleton from './LoadingSkeleton'
import { formatMembershipDate, formatMembershipPrice, humanizeMembershipStatus } from './membershipUtils'

const pageSize = 10
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const emptyDetails = { open: false, loading: false, error: '', membership: null, id: null }
const statusStyles = { active: 'border-accent/30 bg-accent/10 text-accent', expired: 'border-amber-300/30 bg-amber-500/10 text-amber-200', cancelled: 'border-rose-300/30 bg-rose-500/10 text-rose-200' }

const readableError = (error, fallback) => error.status === 401 ? 'Your session has expired. Please sign in again.' : error.status === 403 ? 'You do not have permission to view this Membership.' : error.status === 404 ? 'Your Member profile is not available yet.' : error.isNetworkError ? 'Unable to connect to FitOps. Check your connection and try again.' : getMemberMembershipErrorMessage(error, fallback)

export default function MemberMembershipPage() {
  const [current, setCurrent] = useState(null)
  const [currentLoading, setCurrentLoading] = useState(true)
  const [currentError, setCurrentError] = useState('')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [pagination, setPagination] = useState(emptyPagination)
  const [page, setPage] = useState(1)
  const [refreshToken, setRefreshToken] = useState(0)
  const [details, setDetails] = useState(emptyDetails)
  const detailsRequestRef = useRef(0)

  useEffect(() => {
    let active = true
    setCurrentLoading(true); setCurrentError('')
    getCurrentMembership().then((membership) => { if (active) setCurrent(membership) }).catch((error) => { if (!active) return; if (error.status === 404 && error.message === 'No membership found.') setCurrent(null); else { setCurrent(null); setCurrentError(readableError(error, 'Unable to load your current Membership.')) } }).finally(() => { if (active) setCurrentLoading(false) })
    return () => { active = false }
  }, [refreshToken])

  useEffect(() => {
    let active = true
    setHistoryLoading(true); setHistoryError('')
    listMemberMemberships({ page, per_page: pageSize }).then((response) => { if (!active) return; setHistory(response.memberships); setPagination({ ...emptyPagination, ...response.pagination }) }).catch((error) => { if (!active) return; setHistory([]); setPagination(emptyPagination); setHistoryError(readableError(error, 'Unable to load your Membership history.')) }).finally(() => { if (active) setHistoryLoading(false) })
    return () => { active = false }
  }, [page, refreshToken])

  useEffect(() => { if (page > pagination.last_page) setPage(Math.max(1, pagination.last_page)) }, [page, pagination.last_page])

  const closeDetails = useCallback(() => { detailsRequestRef.current += 1; setDetails(emptyDetails) }, [])
  const loadDetails = useCallback(async (id) => {
    const requestId = detailsRequestRef.current + 1; detailsRequestRef.current = requestId
    setDetails({ open: true, loading: true, error: '', membership: null, id })
    try { const membership = await showMemberMembership(id); if (detailsRequestRef.current === requestId) setDetails({ open: true, loading: false, error: '', membership, id }) } catch (error) { if (detailsRequestRef.current !== requestId) return; setDetails({ open: true, loading: false, error: error.status === 404 ? 'This Membership record is not available.' : readableError(error, 'Unable to load this Membership record.'), membership: null, id }) }
  }, [])

  const retryAll = () => setRefreshToken((value) => value + 1)
  const showHistory = !historyLoading && !historyError

  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 sm:space-y-10"><PageIntro eyebrow="My account" title="My membership" description="Review your current plan, membership details, and history." />{currentError && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{currentError}</p><button type="button" onClick={retryAll} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-amber-100"><RefreshCw size={15} /> Retry</button></div></div>}{currentLoading ? <LoadingSkeleton /> : currentError ? null : current ? <CurrentMembership membership={current} /> : <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-14 text-center shadow-[0_16px_50px_rgba(18,18,18,0.04)]"><ShieldCheck className="mx-auto text-ink/35" size={30} /><h2 className="mt-5 font-heading text-3xl uppercase tracking-wide text-ink">No active membership</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/50">You do not have a current Membership record. Your Membership history will appear below when available.</p></div>}{historyError && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{historyError}</p><button type="button" onClick={retryAll} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-amber-100"><RefreshCw size={15} /> Retry</button></div></div>}{historyLoading ? <HistorySkeleton /> : showHistory && history.length === 0 ? <div className="rounded-2xl border border-ink/10 bg-white px-6 py-14 text-center shadow-[0_16px_50px_rgba(18,18,18,0.04)]"><CreditCard className="mx-auto text-ink/35" size={30} /><h2 className="mt-5 font-heading text-3xl uppercase tracking-wide text-ink">No Membership history</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/50">Your Membership records will appear here when they are available.</p></div> : showHistory && <><MembershipHistory memberships={history} onView={loadDetails} /><div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_16px_50px_rgba(18,18,18,0.04)] sm:flex-row sm:items-center sm:justify-between"><p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> Memberships</p><div className="flex items-center justify-between gap-2 sm:justify-end"><button type="button" disabled={pagination.current_page <= 1 || historyLoading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="whitespace-nowrap rounded-full bg-ink px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-accent sm:px-4 sm:text-xs">Page {pagination.current_page} of {pagination.last_page}</span><button type="button" disabled={pagination.current_page >= pagination.last_page || historyLoading} onClick={() => setPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></>}{details.open && <MembershipDetails open={details.open} loading={details.loading} error={details.error} membership={details.membership} onClose={closeDetails} onRetry={() => loadDetails(details.membership?.id ?? details.id)} />}</motion.div>
}

function CurrentMembership({ membership }) {
  const status = membership.status
  return <section className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white shadow-[0_24px_70px_rgba(18,18,18,0.16)] sm:p-8 lg:p-10"><div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-accent/15 blur-3xl" /><div className="relative"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">Current membership</p><h2 className="mt-3 font-heading text-4xl uppercase tracking-wide sm:text-5xl">{membership.membership_plan?.name || 'Membership'}</h2><p className="mt-3 font-mono text-xs text-white/50">{membership.membership_number || 'Number unavailable'}</p></div><span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${statusStyles[status] || 'border-white/20 bg-white/10 text-white'}`}>{humanizeMembershipStatus(status)}</span></div><dl className="mt-8 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-xs text-white/50">Plan duration</dt><dd className="mt-1 text-lg font-bold">{membership.membership_plan?.duration_days ?? '—'} days</dd></div><div><dt className="text-xs text-white/50">Price</dt><dd className="mt-1 text-lg font-bold">{formatMembershipPrice(membership.price)}</dd></div><div><dt className="text-xs text-white/50">Start date</dt><dd className="mt-1 text-sm font-semibold">{formatMembershipDate(membership.starts_at)}</dd></div><div><dt className="text-xs text-white/50">End date</dt><dd className="mt-1 text-sm font-semibold">{formatMembershipDate(membership.ends_at)}</dd></div></dl><div className="mt-6 flex flex-col gap-2 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between"><span>{membership.auto_renew ? 'Auto-renew is enabled' : 'Auto-renew is disabled'}</span><span>{membership.days_remaining ?? 0} days remaining</span></div></div></section>
}

function HistorySkeleton() { return <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-6"><div className="h-8 w-48 animate-pulse rounded bg-ink/5" />{[1, 2, 3].map((item) => <div key={item} className="mt-5 h-20 animate-pulse rounded-xl bg-ink/[0.035]" />)}</div> }
