import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarX2, RefreshCw } from 'lucide-react'
import { listMemberAttendance, showMemberAttendance, getMemberAttendanceErrorMessage } from '../../../services/memberAttendanceService'
import { PageIntro } from '../components/MemberUI'
import AttendanceDetailsModal from './AttendanceDetailsModal'
import AttendanceFilters from './AttendanceFilters'
import AttendanceList from './AttendanceList'
import LoadingSkeleton from './LoadingSkeleton'

const pageSize = 10
const emptyFilters = { date_from: '', date_to: '', session_state: 'all' }
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const emptyDetails = { open: false, loading: false, attendance: null, error: '' }

const hasFilters = (filters) => Boolean(filters.date_from || filters.date_to || filters.session_state !== 'all')

export default function MemberAttendancePage() {
  const [attendance, setAttendance] = useState([])
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(emptyPagination)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [refreshToken, setRefreshToken] = useState(0)
  const [details, setDetails] = useState(emptyDetails)
  const detailsRequestRef = useRef(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setPageError('')

    const params = { page: currentPage, per_page: pageSize }
    if (appliedFilters.date_from) params.date_from = appliedFilters.date_from
    if (appliedFilters.date_to) params.date_to = appliedFilters.date_to
    if (appliedFilters.session_state !== 'all') params.session_state = appliedFilters.session_state

    listMemberAttendance(params)
      .then((response) => {
        if (!active) return
        setAttendance(response.attendance)
        setPagination({ ...emptyPagination, ...response.pagination })
      })
      .catch((error) => {
        if (!active) return
        const message = error.status === 401
          ? 'Your session has expired. Please sign in again.'
          : error.status === 404
          ? 'Your Member profile is not available yet.'
          : error.status === 403
            ? 'You do not have permission to view Member attendance.'
            : error.isNetworkError
              ? 'Unable to connect to FitOps. Check your connection and try again.'
              : getMemberAttendanceErrorMessage(error, 'Unable to load your attendance history.')
        setPageError(message)
        setAttendance([])
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [appliedFilters, currentPage, refreshToken])

  useEffect(() => {
    if (currentPage > pagination.last_page) setCurrentPage(Math.max(1, pagination.last_page))
  }, [currentPage, pagination.last_page])

  const handleFilterChange = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value }))

  const applyFilters = (event) => {
    event.preventDefault()
    setCurrentPage(1)
    setAppliedFilters({ ...draftFilters })
    if (currentPage === 1 && JSON.stringify(appliedFilters) === JSON.stringify(draftFilters)) setRefreshToken((value) => value + 1)
  }

  const clearFilters = () => {
    setDraftFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setCurrentPage(1)
  }

  const closeDetails = useCallback(() => {
    detailsRequestRef.current += 1
    setDetails(emptyDetails)
  }, [])

  const loadDetails = useCallback(async (id) => {
    const requestId = detailsRequestRef.current + 1
    detailsRequestRef.current = requestId
    setDetails({ open: true, loading: true, attendance: null, error: '' })
    try {
      const record = await showMemberAttendance(id)
      if (detailsRequestRef.current !== requestId) return
      setDetails({ open: true, loading: false, attendance: record, error: '' })
    } catch (error) {
      if (detailsRequestRef.current !== requestId) return
      const message = error.status === 401
        ? 'Your session has expired. Please sign in again.'
        : error.status === 404
        ? 'This attendance record could not be found.'
        : error.status === 403
          ? 'You do not have permission to view this attendance record.'
          : error.isNetworkError
            ? 'Unable to connect to FitOps. Check your connection and try again.'
            : getMemberAttendanceErrorMessage(error, 'Unable to load this attendance record.')
      setDetails({ open: true, loading: false, attendance: null, error: message, id })
    }
  }, [])

  const filtered = hasFilters(appliedFilters)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-7 sm:space-y-8">
      <PageIntro eyebrow="My activity" title="Attendance" description="Track your gym visits and workout sessions." />
      <AttendanceFilters filters={draftFilters} loading={loading} hasActiveFilters={hasFilters(draftFilters) || filtered} onChange={handleFilterChange} onApply={applyFilters} onClear={clearFilters} />

      {pageError && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-amber-100"><RefreshCw size={15} /> Retry</button></div></div>}

      {loading ? <LoadingSkeleton /> : pageError ? null : attendance.length === 0 ? <div className="rounded-2xl border border-ink/10 bg-white px-6 py-16 text-center shadow-[0_16px_50px_rgba(18,18,18,0.04)]"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-ink"><CalendarX2 size={24} /></span><h2 className="mt-6 font-heading text-3xl uppercase tracking-wide text-ink">{filtered ? 'No attendance found' : 'No attendance yet'}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/50">{filtered ? 'Try adjusting your date or status filters.' : 'Your gym visits will appear here after your first check-in.'}</p>{filtered && <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-wider text-accent transition hover:-translate-y-0.5">Clear filters</button>}</div> : <>
        <AttendanceList attendance={attendance} onView={loadDetails} />
        <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_16px_50px_rgba(18,18,18,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> visits</p>
          <div className="flex items-center justify-between gap-2 sm:justify-end"><button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="whitespace-nowrap rounded-full bg-ink px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-accent sm:px-4 sm:text-xs">Page {pagination.current_page} of {pagination.last_page}</span><button type="button" disabled={pagination.current_page >= pagination.last_page || loading} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button></div>
        </div>
      </>}

      <AttendanceDetailsModal open={details.open} loading={details.loading} error={details.error} attendance={details.attendance} onClose={closeDetails} onRetry={() => loadDetails(details.attendance?.id ?? details.id)} />
    </motion.div>
  )
}
