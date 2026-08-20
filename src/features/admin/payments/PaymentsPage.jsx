import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import PaymentFilters from './PaymentFilters'
import PaymentTable from './PaymentTable'
import LoadingSkeleton from './LoadingSkeleton'
import PaymentModal from './PaymentModal'
import PaymentDetailsModal from './PaymentDetailsModal'
import ConfirmPaymentStatusDialog from './ConfirmPaymentStatusDialog'
import {
  createPayment,
  getMembershipPaymentSummary,
  getPaymentErrorMessage,
  getPaymentValidationErrors,
  listAdminPayments,
  loadPaymentMembershipOptions,
  showAdminPayment,
  updatePaymentStatus,
} from '../../../services/adminPaymentService'

const pageSize = 10
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const toLocalDateTime = (value = new Date()) => { const date = new Date(value); const pad = (number) => String(number).padStart(2, '0'); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}` }
const emptyForm = () => ({ membership_id: '', amount: '', payment_method: 'cash', reference_number: '', paid_at: toLocalDateTime(), status: 'pending', notes: '' })
const toastMessage = (error) => error?.isNetworkError ? 'Unable to connect to the server.' : getPaymentErrorMessage(error, 'Something went wrong.')

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(emptyPagination)
  const [refreshToken, setRefreshToken] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [formMessage, setFormMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [memberships, setMemberships] = useState([])
  const [membershipsLoading, setMembershipsLoading] = useState(false)
  const [balance, setBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const balanceRequest = useRef(0)
  const [details, setDetails] = useState({ open: false, loading: false, payment: null, error: '' })
  const [statusAction, setStatusAction] = useState(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)

  useEffect(() => { const timer = window.setTimeout(() => setSearch(searchInput), 250); return () => window.clearTimeout(timer) }, [searchInput])
  useEffect(() => setCurrentPage(1), [search, status, paymentMethod])
  useEffect(() => {
    let active = true
    const loadPayments = async () => {
      setLoading(true); setPageError('')
      try {
        const response = await listAdminPayments({ page: currentPage, per_page: pageSize, search, status, payment_method: paymentMethod })
        if (!active) return
        setPayments(response.payments); setPagination(response.pagination || emptyPagination)
      } catch (error) {
        if (!active) return
        setPayments([]); setPagination(emptyPagination); setPageError(getPaymentErrorMessage(error, 'We could not load payments right now.'))
      } finally { if (active) setLoading(false) }
    }
    loadPayments()
    return () => { active = false }
  }, [currentPage, refreshToken, search, status, paymentMethod])
  useEffect(() => { if (currentPage > pagination.last_page) setCurrentPage(pagination.last_page || 1) }, [currentPage, pagination.last_page])

  const closeModal = () => { setModalOpen(false); setForm(emptyForm()); setFormErrors({}); setFormMessage(''); setSaving(false); setBalance(null); setBalanceLoading(false); balanceRequest.current += 1 }
  const openCreate = async () => {
    setForm(emptyForm()); setFormErrors({}); setFormMessage(''); setBalance(null); setMemberships([]); setMembershipsLoading(true); setModalOpen(true)
    try { setMemberships(await loadPaymentMembershipOptions()) } catch (error) { setFormMessage(getPaymentErrorMessage(error, 'Unable to load Membership options.')) } finally { setMembershipsLoading(false) }
  }
  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value })); setFormErrors((current) => ({ ...current, [name]: null })); setFormMessage('')
    if (name === 'membership_id') {
      const requestId = balanceRequest.current + 1; balanceRequest.current = requestId; setBalance(null); setBalanceLoading(Boolean(value))
      if (!value) { setBalanceLoading(false); return }
      const selected = memberships.find((membership) => String(membership.id) === String(value))
      if (!selected) { setBalanceLoading(false); return }
      getMembershipPaymentSummary(selected).then((summary) => { if (balanceRequest.current === requestId) setBalance(summary) }).catch((error) => { if (balanceRequest.current === requestId) setFormMessage(getPaymentErrorMessage(error, 'Unable to load the Membership balance.')) }).finally(() => { if (balanceRequest.current === requestId) setBalanceLoading(false) })
    }
  }
  const handleSubmit = async (event) => {
    event.preventDefault(); setSaving(true); setFormErrors({}); setFormMessage('')
    const payload = { membership_id: Number(form.membership_id), amount: Number(form.amount), payment_method: form.payment_method, reference_number: form.reference_number || null, paid_at: form.paid_at, status: form.status, notes: form.notes || null }
    try {
      const created = await createPayment(payload); closeModal(); toast.success(`Payment recorded successfully. ${created?.receipt_number ?? ''}`.trim()); setDetails({ open: true, loading: false, payment: created, error: '' }); setRefreshToken((value) => value + 1)
    } catch (error) {
      const validationErrors = getPaymentValidationErrors(error)
      if (Object.keys(validationErrors).length) { setFormErrors(validationErrors); setFormMessage('Please fix the highlighted fields.'); toast('Please fix the highlighted fields.', { icon: '!' }) } else { setFormMessage(getPaymentErrorMessage(error, 'Unable to save the payment.')); toast.error(toastMessage(error)) }
    } finally { setSaving(false) }
  }
  const openDetails = async (payment) => {
    setDetails({ open: true, loading: true, payment: null, error: '' })
    try { setDetails({ open: true, loading: false, payment: await showAdminPayment(payment.id), error: '' }) } catch (error) { setDetails({ open: true, loading: false, payment: null, error: getPaymentErrorMessage(error, 'Unable to load payment details.') }) }
  }
  const handleStatusUpdate = async () => {
    if (!statusAction) return
    setStatusUpdatingId(statusAction.payment.id)
    try { await updatePaymentStatus(statusAction.payment.id, statusAction.nextStatus, statusAction.payment.paid_at); toast.success('Payment status updated successfully.'); setStatusAction(null); setRefreshToken((value) => value + 1) } catch (error) { toast.error(toastMessage(error)) } finally { setStatusUpdatingId(null) }
  }
  const emptyMessage = search || status !== 'all' || paymentMethod !== 'all' ? 'No payments match your search.' : 'NO PAYMENTS FOUND'

  return <div className="space-y-6"><PaymentFilters search={searchInput} status={status} paymentMethod={paymentMethod} onSearchChange={setSearchInput} onStatusChange={setStatus} onPaymentMethodChange={setPaymentMethod} onAddPayment={openCreate} />{pageError && <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="rounded-full border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 transition hover:bg-amber-100">Retry</button></div></div>}{loading ? <LoadingSkeleton /> : payments.length === 0 ? <div className="rounded-3xl border border-ink/10 bg-white px-6 py-16 text-center shadow-[0_18px_60px_rgba(18,18,18,0.05)]"><p className="font-heading text-3xl uppercase tracking-wide text-ink">{emptyMessage}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">{pageError ? 'Try again when the Payment service is available.' : search || status !== 'all' || paymentMethod !== 'all' ? 'Try a different search or filter.' : 'Record a payment against a Membership to begin the payment history.'}</p></div> : <><PaymentTable payments={payments} onView={openDetails} onStatusChange={(payment, nextStatus) => { if (payment.status !== nextStatus) setStatusAction({ payment, nextStatus }) }} statusUpdatingId={statusUpdatingId} /><div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:flex-row sm:items-center sm:justify-between"><p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> Payments</p><div className="flex items-center gap-2"><button type="button" disabled={pagination.current_page === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">Page {pagination.current_page} of {pagination.last_page}</span><button type="button" disabled={pagination.current_page === pagination.last_page} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></>}{modalOpen && <PaymentModal open={modalOpen} form={form} memberships={memberships} membershipsLoading={membershipsLoading} balance={balance} balanceLoading={balanceLoading} errors={formErrors} message={formMessage} saving={saving} onClose={closeModal} onSubmit={handleSubmit} onChange={handleChange} />}{details.open && <PaymentDetailsModal open={details.open} loading={details.loading} payment={details.payment} error={details.error} onClose={() => setDetails({ open: false, loading: false, payment: null, error: '' })} />}<ConfirmPaymentStatusDialog action={statusAction} loading={Boolean(statusUpdatingId)} onCancel={() => setStatusAction(null)} onConfirm={handleStatusUpdate} /></div>
}
