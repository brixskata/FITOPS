import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AttendanceFilters from './AttendanceFilters'
import AttendanceTable from './AttendanceTable'
import AttendanceModal from './AttendanceModal'
import AttendanceDetailsModal from './AttendanceDetailsModal'
import ConfirmCheckoutDialog from './ConfirmCheckoutDialog'
import LoadingSkeleton from './LoadingSkeleton'
import { toManilaDateTimeInput } from './attendanceUtils'
import {
  checkInMember,
  checkOutMember,
  getAttendanceErrorMessage,
  getAttendanceValidationErrors,
  listAdminAttendance,
  loadAttendanceOptions,
  showAdminAttendance,
} from '../../../services/adminAttendanceService'

const pageSize = 10
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const emptyForm = () => ({ member_id: '', checked_in_at: toManilaDateTimeInput(), notes: '' })
const toastError = (error) => error?.isNetworkError ? 'Unable to connect to the server.' : getAttendanceErrorMessage(error, 'Something went wrong.')

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [memberId, setMemberId] = useState('')
  const [trainerId, setTrainerId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sessionState, setSessionState] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(emptyPagination)
  const [refreshToken, setRefreshToken] = useState(0)
  const [options, setOptions] = useState({ members: [], trainers: [] })
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [formMessage, setFormMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [details, setDetails] = useState({ open: false, loading: false, attendance: null, error: '', id: null })
  const [checkoutRecord, setCheckoutRecord] = useState(null)
  const [checkingOutId, setCheckingOutId] = useState(null)

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true); setOptionsError('')
    try { setOptions(await loadAttendanceOptions()) } catch (error) { setOptionsError(getAttendanceErrorMessage(error, 'Unable to load Member and Trainer options.')) } finally { setOptionsLoading(false) }
  }, [])

  useEffect(() => { loadOptions() }, [loadOptions])
  useEffect(() => { const timer = window.setTimeout(() => setSearch(searchInput.trim()), 250); return () => window.clearTimeout(timer) }, [searchInput])
  useEffect(() => setCurrentPage(1), [search, memberId, trainerId, dateFrom, dateTo, sessionState])
  useEffect(() => {
    let active = true
    const loadAttendance = async () => {
      setLoading(true); setPageError('')
      try {
        const response = await listAdminAttendance({
          page: currentPage,
          per_page: pageSize,
          search: search || undefined,
          member_id: memberId || undefined,
          trainer_id: trainerId || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          session_state: sessionState,
        })
        if (!active) return
        setAttendance(response.attendance); setPagination(response.pagination || emptyPagination)
      } catch (error) {
        if (!active) return
        setAttendance([]); setPagination(emptyPagination); setPageError(getAttendanceErrorMessage(error, 'We could not load Attendance records right now.'))
      } finally { if (active) setLoading(false) }
    }
    loadAttendance()
    return () => { active = false }
  }, [currentPage, dateFrom, dateTo, memberId, refreshToken, search, sessionState, trainerId])
  useEffect(() => { if (currentPage > pagination.last_page) setCurrentPage(pagination.last_page || 1) }, [currentPage, pagination.last_page])

  const clearFilters = () => { setSearchInput(''); setSearch(''); setMemberId(''); setTrainerId(''); setDateFrom(''); setDateTo(''); setSessionState('all') }
  const closeModal = useCallback(() => { setModalOpen(false); setForm(emptyForm()); setFormErrors({}); setFormMessage(''); setSaving(false) }, [])
  const openCheckIn = () => { setForm(emptyForm()); setFormErrors({}); setFormMessage(''); setModalOpen(true); if (optionsError) loadOptions() }
  const handleChange = (event) => { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })); setFormErrors((current) => ({ ...current, [name]: null })); setFormMessage('') }
  const handleCheckIn = async (event) => {
    event.preventDefault(); setSaving(true); setFormErrors({}); setFormMessage('')
    const payload = { member_id: Number(form.member_id), notes: form.notes.trim() || null, ...(form.checked_in_at ? { checked_in_at: form.checked_in_at } : {}) }
    try {
      const created = await checkInMember(payload)
      closeModal(); toast.success('Member checked in successfully.'); setRefreshToken((value) => value + 1)
      setDetails({ open: true, loading: false, attendance: created, error: '', id: created?.id ?? null })
    } catch (error) {
      const errors = getAttendanceValidationErrors(error)
      setFormErrors(errors); setFormMessage(getAttendanceErrorMessage(error, 'Unable to check in the selected Member.'))
      if (error.status === 409) toast.error(getAttendanceErrorMessage(error, 'Member is already checked in.'))
      else if (!Object.keys(errors).length) toast.error(toastError(error))
      else toast('Please review the check-in details.', { icon: '!' })
    } finally { setSaving(false) }
  }
  const openDetails = useCallback(async (record) => {
    const id = record?.id ?? details.id
    if (!id) return
    setDetails({ open: true, loading: true, attendance: null, error: '', id })
    try { setDetails({ open: true, loading: false, attendance: await showAdminAttendance(id), error: '', id }) } catch (error) { setDetails({ open: true, loading: false, attendance: null, error: getAttendanceErrorMessage(error, 'Unable to load Attendance details.'), id }) }
  }, [details.id])
  const closeDetails = useCallback(() => setDetails({ open: false, loading: false, attendance: null, error: '', id: null }), [])
  const requestCheckout = (record) => { setCheckoutRecord(record) }
  const handleCheckout = async () => {
    if (!checkoutRecord) return
    setCheckingOutId(checkoutRecord.id)
    try {
      const updated = await checkOutMember(checkoutRecord.id)
      toast.success('Attendance checked out successfully.'); setCheckoutRecord(null); setRefreshToken((value) => value + 1)
      if (details.open && details.id === updated?.id) setDetails({ open: true, loading: false, attendance: updated, error: '', id: updated.id })
    } catch (error) { toast.error(toastError(error)); if (error.status === 404 || error.status === 409) setRefreshToken((value) => value + 1) } finally { setCheckingOutId(null) }
  }

  const filtered = search || memberId || trainerId || dateFrom || dateTo || sessionState !== 'all'
  const emptyMessage = filtered ? 'No attendance records match your filters.' : 'No attendance records found.'

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <AttendanceFilters search={searchInput} memberId={memberId} trainerId={trainerId} dateFrom={dateFrom} dateTo={dateTo} sessionState={sessionState} members={options.members} trainers={options.trainers} optionsLoading={optionsLoading} optionsError={optionsError} onSearchChange={setSearchInput} onMemberChange={setMemberId} onTrainerChange={setTrainerId} onDateFromChange={setDateFrom} onDateToChange={setDateTo} onSessionStateChange={setSessionState} onClear={clearFilters} onCheckIn={openCheckIn} />
      {pageError && <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="rounded-full border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-amber-100">Retry</button></div></div>}
      {loading ? <LoadingSkeleton /> : pageError && attendance.length === 0 ? null : attendance.length === 0 ? <div className="rounded-3xl border border-ink/10 bg-white px-6 py-16 text-center shadow-[0_18px_60px_rgba(18,18,18,0.05)]"><p className="font-heading text-3xl uppercase tracking-wide text-ink">{emptyMessage}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">{filtered ? 'Clear or adjust the current filters to review other visits.' : 'Check in a Member to begin the Attendance history.'}</p>{filtered && <button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-accent transition hover:-translate-y-0.5">Clear filters</button>}</div> : <><AttendanceTable attendance={attendance} onView={openDetails} onCheckOut={requestCheckout} checkingOutId={checkingOutId} /><div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:flex-row sm:items-center sm:justify-between"><p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> Attendance records</p><div className="flex items-center gap-2"><button type="button" disabled={pagination.current_page === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">Page {pagination.current_page} of {pagination.last_page}</span><button type="button" disabled={pagination.current_page === pagination.last_page} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></>}
      <AttendanceModal open={modalOpen} form={form} members={options.members} membersLoading={optionsLoading} optionsError={optionsError} errors={formErrors} message={formMessage} saving={saving} onClose={closeModal} onSubmit={handleCheckIn} onChange={handleChange} />
      <AttendanceDetailsModal open={details.open} loading={details.loading} error={details.error} attendance={details.attendance} onClose={closeDetails} onRetry={() => openDetails({ id: details.id })} onCheckOut={(record) => { closeDetails(); requestCheckout(record) }} />
      <ConfirmCheckoutDialog attendance={checkoutRecord} loading={Boolean(checkingOutId)} onCancel={() => setCheckoutRecord(null)} onConfirm={handleCheckout} />
    </motion.div>
  )
}
