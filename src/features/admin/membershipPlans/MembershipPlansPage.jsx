import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import PlanFilters from './PlanFilters'
import PlanTable from './PlanTable'
import LoadingSkeleton from './LoadingSkeleton'
import PlanModal from './PlanModal'
import PlanDetailsModal from './PlanDetailsModal'
import ConfirmStatusDialog from './ConfirmStatusDialog'
import {
  createMembershipPlan,
  getMembershipPlanErrorMessage,
  getMembershipPlanValidationErrors,
  listAdminMembershipPlans,
  showAdminMembershipPlan,
  updateMembershipPlan,
  updateMembershipPlanStatus,
} from '../../../services/adminMembershipPlanService'

const pageSize = 10
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const emptyForm = { name: '', description: '', duration_days: '', price: '', status: 'active' }
const buildForm = (plan = {}) => ({ name: plan.name ?? '', description: plan.description ?? '', duration_days: plan.duration_days ?? '', price: plan.price ?? '', status: plan.status ?? 'active' })
const toastMessage = (error) => error?.isNetworkError ? 'Unable to connect to the server.' : 'Something went wrong.'

export default function MembershipPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(emptyPagination)
  const [refreshToken, setRefreshToken] = useState(0)
  const [modal, setModal] = useState({ open: false, mode: 'create', loading: false, message: '', planId: null })
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [details, setDetails] = useState({ open: false, loading: false, plan: null, error: '' })
  const [statusConfirmation, setStatusConfirmation] = useState(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)

  useEffect(() => { const timer = window.setTimeout(() => setSearch(searchInput), 250); return () => window.clearTimeout(timer) }, [searchInput])
  useEffect(() => setCurrentPage(1), [search, status])
  useEffect(() => {
    let active = true
    const loadPlans = async () => {
      setLoading(true); setPageError('')
      try {
        const response = await listAdminMembershipPlans({ page: currentPage, per_page: pageSize, search, status })
        if (!active) return
        setPlans(response.plans); setPagination(response.pagination || emptyPagination)
      } catch (error) {
        if (!active) return
        setPlans([]); setPagination(emptyPagination); setPageError(getMembershipPlanErrorMessage(error, 'We could not load Membership Plans right now.'))
      } finally { if (active) setLoading(false) }
    }
    loadPlans()
    return () => { active = false }
  }, [currentPage, refreshToken, search, status])
  useEffect(() => { if (currentPage > pagination.last_page) setCurrentPage(pagination.last_page || 1) }, [currentPage, pagination.last_page])

  const closeModal = () => { setModal({ open: false, mode: 'create', loading: false, message: '', planId: null }); setForm(emptyForm); setFormErrors({}); setSaving(false) }
  const openCreate = () => { setForm(emptyForm); setFormErrors({}); setModal({ open: true, mode: 'create', loading: false, message: '', planId: null }) }
  const openEdit = async (plan) => {
    setFormErrors({}); setForm(buildForm(plan)); setModal({ open: true, mode: 'edit', loading: true, message: '', planId: plan.id })
    try { const selectedPlan = await showAdminMembershipPlan(plan.id); setForm(buildForm(selectedPlan)); setModal((current) => ({ ...current, loading: false })) } catch (error) { setModal((current) => ({ ...current, loading: false, message: getMembershipPlanErrorMessage(error, 'Unable to load the Membership Plan.') })) }
  }
  const handleChange = (event) => { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })); setFormErrors((current) => ({ ...current, [name]: null })); setModal((current) => ({ ...current, message: '' })) }
  const handleSubmit = async (event) => {
    event.preventDefault(); setSaving(true); setFormErrors({}); setModal((current) => ({ ...current, message: '' }))
    const payload = { name: form.name, description: form.description || null, duration_days: Number(form.duration_days), price: Number(form.price), status: form.status }
    try {
      if (modal.mode === 'edit' && modal.planId) { await updateMembershipPlan(modal.planId, payload); toast.success('Membership Plan updated successfully.') } else { await createMembershipPlan(payload); toast.success('Membership Plan created successfully.') }
      closeModal(); setRefreshToken((value) => value + 1)
    } catch (error) {
      const validationErrors = getMembershipPlanValidationErrors(error)
      if (Object.keys(validationErrors).length) { setFormErrors(validationErrors); setModal((current) => ({ ...current, message: 'Please fix the highlighted fields.' })); toast('Please fix the highlighted fields.', { icon: '!' }) } else { setModal((current) => ({ ...current, message: getMembershipPlanErrorMessage(error, 'Unable to save the Membership Plan.') })); toast.error(toastMessage(error)) }
    } finally { setSaving(false) }
  }
  const openDetails = async (plan) => { setDetails({ open: true, loading: true, plan: null, error: '' }); try { const selectedPlan = await showAdminMembershipPlan(plan.id); setDetails({ open: true, loading: false, plan: selectedPlan, error: '' }) } catch (error) { setDetails({ open: true, loading: false, plan: null, error: getMembershipPlanErrorMessage(error, 'Unable to load Membership Plan details.') }) } }
  const confirmStatusChange = (plan) => setStatusConfirmation({ plan, nextStatus: plan.status === 'active' ? 'inactive' : 'active' })
  const handleStatusChange = async () => {
    if (!statusConfirmation) return
    const { plan, nextStatus } = statusConfirmation; setStatusUpdatingId(plan.id)
    try { const updatedPlan = await updateMembershipPlanStatus(plan.id, nextStatus); setPlans((current) => current.map((item) => item.id === plan.id ? updatedPlan : item).filter((item) => status === 'all' || item.status === status)); toast.success(`Membership Plan ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully.`); setStatusConfirmation(null) } catch (error) { toast.error(toastMessage(error)) } finally { setStatusUpdatingId(null) }
  }
  const emptyMessage = search || status !== 'all' ? (status === 'inactive' && !search ? 'No inactive plans.' : 'No membership plans match your search.') : 'NO MEMBERSHIP PLANS FOUND'

  return <div className="space-y-6"><PlanFilters search={searchInput} status={status} onSearchChange={setSearchInput} onStatusChange={setStatus} onAddPlan={openCreate} />{pageError && <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="rounded-full border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 transition hover:bg-amber-100">Retry</button></div></div>}{loading ? <LoadingSkeleton /> : plans.length === 0 ? <div className="rounded-3xl border border-ink/10 bg-white px-6 py-16 text-center shadow-[0_18px_60px_rgba(18,18,18,0.05)]"><p className="font-heading text-3xl uppercase tracking-wide text-ink">{emptyMessage}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">{pageError ? 'Try again when the Membership Plan service is available.' : status === 'all' && !search ? 'Add a Membership Plan to define the packages available at FitOps.' : 'Try a different search or status filter.'}</p></div> : <><PlanTable plans={plans} onView={openDetails} onEdit={openEdit} onToggleStatus={confirmStatusChange} statusUpdatingId={statusUpdatingId} /><div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:flex-row sm:items-center sm:justify-between"><p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> Membership Plans</p><div className="flex items-center gap-2"><button type="button" disabled={pagination.current_page === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">Page {pagination.current_page} of {pagination.last_page}</span><button type="button" disabled={pagination.current_page === pagination.last_page} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></>}{modal.open && <PlanModal open={modal.open} mode={modal.mode} loading={modal.loading} form={form} errors={formErrors} message={modal.message} saving={saving} onClose={closeModal} onSubmit={handleSubmit} onChange={handleChange} />}{details.open && <PlanDetailsModal open={details.open} loading={details.loading} plan={details.plan} error={details.error} onClose={() => setDetails({ open: false, loading: false, plan: null, error: '' })} />}<ConfirmStatusDialog plan={statusConfirmation?.plan} nextStatus={statusConfirmation?.nextStatus} loading={Boolean(statusUpdatingId)} onCancel={() => setStatusConfirmation(null)} onConfirm={handleStatusChange} /></div>
}
