import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, RefreshCw } from 'lucide-react'
import { getMemberPaymentErrorMessage, listMemberPayments, showMemberPayment } from '../../../services/memberPaymentService'
import { PageIntro } from '../components/MemberUI'
import LoadingSkeleton from './LoadingSkeleton'
import PaymentDetailsModal from './PaymentDetailsModal'
import PaymentFilters from './PaymentFilters'
import PaymentTable from './PaymentTable'

const pageSize = 10
const emptyFilters = { date_from: '', date_to: '', status: 'all', payment_method: 'all' }
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const emptyDetails = { open: false, loading: false, payment: null, error: '', id: null }
const hasFilters = (filters) => Boolean(filters.date_from || filters.date_to || filters.status !== 'all' || filters.payment_method !== 'all')

const readableError = (error) => {
  if (error.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.status === 403) return 'You do not have permission to view your payments.'
  if (error.status === 404) return 'Your Member profile is not available yet.'
  if (error.status === 422) return 'Some payment filters are invalid.'
  if (error.isNetworkError) return 'Unable to connect to FitOps. Check your connection and try again.'
  return getMemberPaymentErrorMessage(error, 'Unable to load payment records.')
}

export default function MemberPaymentsPage() {
  const [payments, setPayments] = useState([])
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
    Object.entries(appliedFilters).forEach(([key, value]) => { if (value && value !== 'all') params[key] = value })
    listMemberPayments(params)
      .then((response) => { if (active) { setPayments(response.payments); setPagination({ ...emptyPagination, ...response.pagination }) } })
      .catch((error) => { if (active) { setPayments([]); setPagination(emptyPagination); setPageError(readableError(error)) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [appliedFilters, currentPage, refreshToken])

  useEffect(() => { if (currentPage > pagination.last_page) setCurrentPage(Math.max(1, pagination.last_page)) }, [currentPage, pagination.last_page])

  const applyFilters = (event) => {
    event.preventDefault()
    setCurrentPage(1)
    setAppliedFilters({ ...draftFilters })
    if (currentPage === 1 && JSON.stringify(appliedFilters) === JSON.stringify(draftFilters)) setRefreshToken((value) => value + 1)
  }

  const clearFilters = () => { setDraftFilters(emptyFilters); setAppliedFilters(emptyFilters); setCurrentPage(1) }
  const closeDetails = useCallback(() => { detailsRequestRef.current += 1; setDetails(emptyDetails) }, [])

  const loadDetails = useCallback(async (id) => {
    const requestId = detailsRequestRef.current + 1
    detailsRequestRef.current = requestId
    setDetails({ open: true, loading: true, payment: null, error: '', id })
    try {
      const payment = await showMemberPayment(id)
      if (detailsRequestRef.current === requestId) setDetails({ open: true, loading: false, payment, error: '', id })
    } catch (error) {
      if (detailsRequestRef.current === requestId) setDetails({ open: true, loading: false, payment: null, error: readableError(error), id })
    }
  }, [])

  const filtered = hasFilters(appliedFilters)
  const emptyTitle = filtered ? 'No payments found' : 'No payment records yet'
  const emptyDescription = filtered ? 'Try adjusting your current filters.' : 'Your FitOps payment history will appear here when available.'

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-7 sm:space-y-8">
      <PageIntro eyebrow="My account" title="Payments" description="View your membership payment history and receipts." />
      <PaymentFilters filters={draftFilters} loading={loading} hasActiveFilters={hasFilters(draftFilters) || filtered} onChange={(field, value) => setDraftFilters((current) => ({ ...current, [field]: value }))} onApply={applyFilters} onClear={clearFilters} />
      {pageError && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-amber-100"><RefreshCw size={15} /> Retry</button></div></div>}
      {loading ? <LoadingSkeleton /> : pageError ? null : payments.length === 0 ? (
        <div className="rounded-2xl border border-ink/10 bg-white px-6 py-16 text-center shadow-[0_16px_50px_rgba(18,18,18,0.04)]">
          <CreditCard className="mx-auto text-ink/35" size={30} />
          <h2 className="mt-5 font-heading text-3xl uppercase tracking-wide text-ink">{emptyTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/50">{emptyDescription}</p>
          {filtered && <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-wider text-accent transition hover:-translate-y-0.5">Clear filters</button>}
        </div>
      ) : (
        <>
          <PaymentTable payments={payments} onView={loadDetails} />
          <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_16px_50px_rgba(18,18,18,0.04)] sm:flex-row sm:items-center sm:justify-between">
            <p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> payments</p>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <span className="whitespace-nowrap rounded-full bg-ink px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-accent sm:px-4 sm:text-xs">Page {pagination.current_page} of {pagination.last_page}</span>
              <button type="button" disabled={pagination.current_page >= pagination.last_page || loading} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        </>
      )}
      {details.open && <PaymentDetailsModal open={details.open} loading={details.loading} error={details.error} payment={details.payment} onClose={closeDetails} onRetry={() => loadDetails(details.payment?.id ?? details.id)} />}
    </motion.div>
  )
}
