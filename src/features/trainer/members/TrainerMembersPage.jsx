import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, UsersRound } from 'lucide-react'
import { getTrainerDashboard } from '../../../services/trainerDashboardService'
import { getTrainerMembersErrorMessage, listTrainerMembers, showTrainerMember } from '../../../services/trainerMembersService'
import MemberDetailsModal from './MemberDetailsModal'
import MemberFilters from './MemberFilters'
import MemberTable from './MemberTable'
import LoadingSkeleton from './LoadingSkeleton'

const pageSize = 10
const initialFilters = { member_id: '', status: 'all', membership_status: 'all' }
const initialPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const initialDetails = { open: false, loading: false, error: '', member: null, id: null }

const hasFilters = (filters, search) => Boolean(search || filters.member_id || filters.status !== 'all' || filters.membership_status !== 'all')

export default function TrainerMembersPage() {
  const [members, setMembers] = useState([])
  const [memberOptions, setMemberOptions] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [refreshToken, setRefreshToken] = useState(0)
  const [details, setDetails] = useState(initialDetails)
  const detailsRequestRef = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setCurrentPage(1) }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let active = true
    getTrainerDashboard().then((dashboard) => { if (active) setMemberOptions(Array.isArray(dashboard?.members) ? dashboard.members : []) }).catch(() => { if (active) setMemberOptions([]) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true); setPageError('')
    const params = { page: currentPage, per_page: pageSize }
    if (search) params.search = search
    if (filters.member_id) params.member_id = filters.member_id
    if (filters.status !== 'all') params.status = filters.status
    if (filters.membership_status !== 'all') params.membership_status = filters.membership_status
    listTrainerMembers(params).then((response) => { if (!active) return; setMembers(response.members); setPagination({ ...initialPagination, ...response.pagination }) }).catch((error) => { if (!active) return; setMembers([]); setPagination(initialPagination); setPageError(error.status === 401 ? 'Your session has expired. Please sign in again.' : error.status === 403 ? 'You do not have permission to view your roster.' : error.status === 404 ? 'Your Trainer profile is not available.' : error.isNetworkError ? 'Unable to connect to FitOps. Check your connection and try again.' : getTrainerMembersErrorMessage(error, 'Unable to load your roster.')) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [currentPage, filters, refreshToken, search])

  useEffect(() => { if (currentPage > pagination.last_page) setCurrentPage(Math.max(1, pagination.last_page)) }, [currentPage, pagination.last_page])

  const handleFilterChange = (field, value) => { setFilters((current) => ({ ...current, [field]: value })); setCurrentPage(1) }
  const clearFilters = () => { setSearchInput(''); setSearch(''); setFilters(initialFilters); setCurrentPage(1) }
  const closeDetails = useCallback(() => { detailsRequestRef.current += 1; setDetails(initialDetails) }, [])
  const loadDetails = useCallback(async (id) => {
    const requestId = detailsRequestRef.current + 1; detailsRequestRef.current = requestId
    setDetails({ open: true, loading: true, error: '', member: null, id })
    try { const member = await showTrainerMember(id); if (detailsRequestRef.current === requestId) setDetails({ open: true, loading: false, error: '', member, id }) } catch (error) { if (detailsRequestRef.current !== requestId) return; setDetails({ open: true, loading: false, error: error.status === 401 ? 'Your session has expired. Please sign in again.' : error.status === 403 ? 'You do not have permission to view this Member.' : error.status === 404 ? 'Member not found or no longer assigned to you.' : error.isNetworkError ? 'Unable to connect to FitOps. Check your connection and try again.' : getTrainerMembersErrorMessage(error, 'Unable to load this Member.'), member: null, id }) }
  }, [])
  const filtered = hasFilters(filters, searchInput)

  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-7 sm:space-y-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker text-ink/45">Trainer workspace</p><h1 className="mt-2 font-heading text-4xl uppercase leading-none tracking-wide text-ink sm:text-5xl">My members</h1><p className="mt-4 max-w-xl text-sm text-ink/60">View the Members currently assigned to your coaching roster.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/20 px-3 py-1.5 text-xs font-bold text-ink"><UsersRound size={14} /> Read-only roster</span></div><MemberFilters search={searchInput} filters={filters} members={memberOptions} loading={loading} hasActiveFilters={hasFilters(filters, searchInput)} onSearchChange={setSearchInput} onFilterChange={handleFilterChange} onClear={clearFilters} />{pageError && !members.length && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-amber-100"><RefreshCw size={15} /> Retry</button></div></div>}{loading ? <LoadingSkeleton /> : pageError ? null : members.length === 0 ? <div className="rounded-2xl border border-ink/10 bg-white px-6 py-16 text-center shadow-[0_16px_50px_rgba(18,18,18,0.04)]"><UsersRound className="mx-auto text-ink/35" size={30} /><h2 className="mt-5 font-heading text-3xl uppercase tracking-wide text-ink">{filtered ? 'No members match your filters.' : 'No members assigned yet.'}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/50">{filtered ? 'Try clearing or adjusting your filters.' : 'Members assigned to you will appear here when your roster is updated.'}</p>{filtered && <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-wider text-accent transition hover:-translate-y-0.5">Clear filters</button>}</div> : <><MemberTable members={members} onView={loadDetails} /><div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_16px_50px_rgba(18,18,18,0.04)] sm:flex-row sm:items-center sm:justify-between"><p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> members</p><div className="flex items-center justify-between gap-2 sm:justify-end"><button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="whitespace-nowrap rounded-full bg-ink px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-accent sm:px-4 sm:text-xs">Page {pagination.current_page} of {pagination.last_page}</span><button type="button" disabled={pagination.current_page >= pagination.last_page || loading} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></>}{details.open && <MemberDetailsModal open={details.open} loading={details.loading} error={details.error} member={details.member} onClose={closeDetails} onRetry={() => loadDetails(details.member?.id ?? details.id)} />}</motion.div>
}
