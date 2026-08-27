import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarX2, RefreshCw } from 'lucide-react'
import { getTrainerDashboard } from '../../../services/trainerDashboardService'
import { getTrainerAttendanceErrorMessage, listTrainerAttendance, showTrainerAttendance } from '../../../services/trainerAttendanceService'
import AttendanceDetailsModal from './AttendanceDetailsModal'
import AttendanceFilters from './AttendanceFilters'
import AttendanceTable from './AttendanceTable'
import LoadingSkeleton from './LoadingSkeleton'

const pageSize = 10
const emptyFilters = { member_id: '', date_from: '', date_to: '', session_state: 'all' }
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const emptyDetails = { open: false, loading: false, attendance: null, error: '', id: null }

const hasFilters = (filters, search) => Boolean(search || filters.member_id || filters.date_from || filters.date_to || filters.session_state !== 'all')

export default function TrainerAttendancePage() {
  const [attendance, setAttendance] = useState([])
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [memberOptionsError, setMemberOptionsError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(emptyPagination)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [refreshToken, setRefreshToken] = useState(0)
  const [details, setDetails] = useState(emptyDetails)
  const detailsRequestRef = useRef(0)

  useEffect(() => {
    let active = true
    setMembersLoading(true)
    getTrainerDashboard()
      .then((dashboard) => { if (active) setMembers(Array.isArray(dashboard?.members) ? dashboard.members : []) })
      .catch((error) => { if (active) setMemberOptionsError(error.message || 'Unable to load your roster.') })
      .finally(() => { if (active) setMembersLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCurrentPage(1)
      setSearch(searchInput.trim())
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    let active = true
    setLoading(true)
    setPageError('')

    const params = { page: currentPage, per_page: pageSize }
    if (search) params.search = search
    if (filters.member_id) params.member_id = filters.member_id
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    if (filters.session_state !== 'all') params.session_state = filters.session_state

    listTrainerAttendance(params)
      .then((response) => {
        if (!active) return
        setAttendance(response.attendance)
        setPagination({ ...emptyPagination, ...response.pagination })
      })
      .catch((error) => {
        if (!active) return
        const message = error.status === 401
          ? 'Your session has expired. Please sign in again.'
          : error.status === 403
            ? 'You do not have permission to view Trainer attendance.'
            : error.status === 404
              ? 'Your Trainer profile is not available.'
              : error.isNetworkError
                ? 'Unable to connect to FitOps. Check your connection and try again.'
                : getTrainerAttendanceErrorMessage(error, 'Unable to load Trainer attendance.')
        setPageError(message)
        setAttendance([])
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [currentPage, filters, refreshToken, search])

  useEffect(() => {
    if (currentPage > pagination.last_page) setCurrentPage(Math.max(1, pagination.last_page))
  }, [currentPage, pagination.last_page])

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setFilters(emptyFilters)
    setCurrentPage(1)
  }

  const closeDetails = useCallback(() => {
    detailsRequestRef.current += 1
    setDetails(emptyDetails)
  }, [])

  const loadDetails = useCallback(async (id) => {
    const requestId = detailsRequestRef.current + 1
    detailsRequestRef.current = requestId
    setDetails({ open: true, loading: true, attendance: null, error: '', id })
    try {
      const record = await showTrainerAttendance(id)
      if (detailsRequestRef.current !== requestId) return
      setDetails({ open: true, loading: false, attendance: record, error: '', id })
    } catch (error) {
      if (detailsRequestRef.current !== requestId) return
      const message = error.status === 401
        ? 'Your session has expired. Please sign in again.'
        : error.status === 403
          ? 'You do not have permission to view this attendance record.'
          : error.status === 404
            ? 'This attendance record is not available to you.'
            : error.isNetworkError
              ? 'Unable to connect to FitOps. Check your connection and try again.'
              : getTrainerAttendanceErrorMessage(error, 'Unable to load this attendance record.')
      setDetails({ open: true, loading: false, attendance: null, error: message, id })
    }
  }, [])

  const filtered = hasFilters(filters, searchInput)

  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-7 sm:space-y-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker text-ink/45">Trainer workspace</p><h1 className="mt-2 font-heading text-4xl uppercase leading-none tracking-wide text-ink sm:text-5xl">Attendance</h1><p className="mt-4 max-w-xl text-sm text-ink/60">Review visit history for Members currently assigned to you.</p></div><span className="inline-flex w-fit rounded-full bg-accent/20 px-3 py-1.5 text-xs font-bold text-ink">Read-only history</span></div><AttendanceFilters search={searchInput} filters={filters} members={members} membersLoading={membersLoading} memberOptionsError={memberOptionsError} loading={loading} hasActiveFilters={hasFilters(filters, searchInput)} onSearchChange={setSearchInput} onFilterChange={handleFilterChange} onClear={clearFilters} />{pageError && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-amber-100"><RefreshCw size={15} /> Retry</button></div></div>}{loading ? <LoadingSkeleton /> : pageError ? null : attendance.length === 0 ? <div className="rounded-2xl border border-ink/10 bg-white px-6 py-16 text-center shadow-[0_16px_50px_rgba(18,18,18,0.04)]"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-ink"><CalendarX2 size={24} /></span><h2 className="mt-6 font-heading text-3xl uppercase tracking-wide text-ink">{filtered ? 'No attendance records match your filters.' : 'No attendance records found.'}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/50">{filtered ? 'Try clearing or adjusting your search and filters.' : 'Attendance from your assigned Members will appear here when visits are recorded.'}</p>{filtered && <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-wider text-accent transition hover:-translate-y-0.5">Clear filters</button>}</div> : <><AttendanceTable attendance={attendance} onView={loadDetails} /><div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_16px_50px_rgba(18,18,18,0.04)] sm:flex-row sm:items-center sm:justify-between"><p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> visits</p><div className="flex items-center justify-between gap-2 sm:justify-end"><button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="whitespace-nowrap rounded-full bg-ink px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-accent sm:px-4 sm:text-xs">Page {pagination.current_page} of {pagination.last_page}</span><button type="button" disabled={pagination.current_page >= pagination.last_page || loading} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></>}{details.open && <AttendanceDetailsModal open={details.open} loading={details.loading} error={details.error} attendance={details.attendance} onClose={closeDetails} onRetry={() => loadDetails(details.attendance?.id ?? details.id)} />}</motion.div>
}
