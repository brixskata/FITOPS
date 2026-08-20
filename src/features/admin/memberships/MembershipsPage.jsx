import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import MembershipFilters from './MembershipFilters'
import MembershipTable from './MembershipTable'
import LoadingSkeleton from './LoadingSkeleton'
import MembershipModal from './MembershipModal'
import MembershipDetailsModal from './MembershipDetailsModal'
import ConfirmMembershipActionDialog from './ConfirmMembershipActionDialog'
import {
  createMembership,
  getMembershipErrorMessage,
  getMembershipValidationErrors,
  listAdminMemberships,
  loadMembershipFormOptions,
  renewMembership,
  showAdminMembership,
  updateMembership,
  updateMembershipStatus,
} from '../../../services/adminMembershipService'

const pageSize = 10
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const emptyForm = { member_id: '', membership_plan_id: '', starts_at: '', auto_renew: false }
const toastMessage = (error) => error?.isNetworkError ? 'Unable to connect to the server.' : 'Something went wrong.'
const editForm = (membership = {}) => ({
  starts_at: membership.starts_at ?? '',
  auto_renew: Boolean(membership.auto_renew),
  member_name: membership.member?.name ?? '',
  member_email: membership.member?.email ?? '',
  plan_name: membership.membership_plan?.name ?? '',
  membership_number: membership.membership_number ?? '',
  price: membership.price ?? '',
})

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(emptyPagination)
  const [refreshToken, setRefreshToken] = useState(0)
  const [modal, setModal] = useState({ open: false, mode: 'create', loading: false, message: '', membershipId: null })
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [options, setOptions] = useState({ members: [], plans: [] })
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [details, setDetails] = useState({ open: false, loading: false, membership: null, error: '' })
  const [confirmation, setConfirmation] = useState(null)
  const [renewingId, setRenewingId] = useState(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)

  useEffect(() => { const timer = window.setTimeout(() => setSearch(searchInput), 250); return () => window.clearTimeout(timer) }, [searchInput])
  useEffect(() => setCurrentPage(1), [search, status])
  useEffect(() => {
    let active = true
    const loadMemberships = async () => {
      setLoading(true); setPageError('')
      try {
        const response = await listAdminMemberships({ page: currentPage, per_page: pageSize, search, status })
        if (!active) return
        setMemberships(response.memberships); setPagination(response.pagination || emptyPagination)
      } catch (error) {
        if (!active) return
        setMemberships([]); setPagination(emptyPagination); setPageError(getMembershipErrorMessage(error, 'We could not load memberships right now.'))
      } finally { if (active) setLoading(false) }
    }
    loadMemberships()
    return () => { active = false }
  }, [currentPage, refreshToken, search, status])
  useEffect(() => { if (currentPage > pagination.last_page) setCurrentPage(pagination.last_page || 1) }, [currentPage, pagination.last_page])

  const closeModal = () => { setModal({ open: false, mode: 'create', loading: false, message: '', membershipId: null }); setForm(emptyForm); setFormErrors({}); setSaving(false) }
  const openCreate = async () => {
    setForm(emptyForm); setFormErrors({}); setOptions({ members: [], plans: [] }); setOptionsLoading(true)
    setModal({ open: true, mode: 'create', loading: false, message: '', membershipId: null })
    try { setOptions(await loadMembershipFormOptions()) } catch (error) { setModal((current) => ({ ...current, message: getMembershipErrorMessage(error, 'Unable to load member and plan options.') })) } finally { setOptionsLoading(false) }
  }
  const openEdit = async (membership) => {
    setFormErrors({}); setForm(editForm(membership)); setModal({ open: true, mode: 'edit', loading: true, message: '', membershipId: membership.id })
    try { setForm(editForm(await showAdminMembership(membership.id))); setModal((current) => ({ ...current, loading: false })) } catch (error) { setModal((current) => ({ ...current, loading: false, message: getMembershipErrorMessage(error, 'Unable to load the membership.') })) }
  }
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setFormErrors((current) => ({ ...current, [name]: null }))
    setModal((current) => ({ ...current, message: '' }))
  }
  const handleSubmit = async (event) => {
    event.preventDefault(); setSaving(true); setFormErrors({}); setModal((current) => ({ ...current, message: '' }))
    const payload = modal.mode === 'edit'
      ? { starts_at: form.starts_at, auto_renew: Boolean(form.auto_renew) }
      : { member_id: Number(form.member_id), membership_plan_id: Number(form.membership_plan_id), starts_at: form.starts_at, auto_renew: Boolean(form.auto_renew) }
    try {
      if (modal.mode === 'edit' && modal.membershipId) { await updateMembership(modal.membershipId, payload); toast.success('Membership updated successfully.') } else { await createMembership(payload); toast.success('Membership created successfully.') }
      closeModal(); setRefreshToken((value) => value + 1)
    } catch (error) {
      const validationErrors = getMembershipValidationErrors(error)
      if (Object.keys(validationErrors).length) { setFormErrors(validationErrors); setModal((current) => ({ ...current, message: 'Please fix the highlighted fields.' })); toast('Please fix the highlighted fields.', { icon: '!' }) } else { setModal((current) => ({ ...current, message: getMembershipErrorMessage(error, 'Unable to save the membership.') })); toast.error(toastMessage(error)) }
    } finally { setSaving(false) }
  }
  const openDetails = async (membership) => {
    setDetails({ open: true, loading: true, membership: null, error: '' })
    try { setDetails({ open: true, loading: false, membership: await showAdminMembership(membership.id), error: '' }) } catch (error) { setDetails({ open: true, loading: false, membership: null, error: getMembershipErrorMessage(error, 'Unable to load membership details.') }) }
  }
  const handleConfirm = async () => {
    if (!confirmation) return
    const { membership, type, nextStatus } = confirmation
    if (type === 'renew') setRenewingId(membership.id)
    else setStatusUpdatingId(membership.id)
    try {
      if (type === 'renew') {
        const renewed = await renewMembership(membership.id)
        toast.success('Membership renewed successfully.')
        setDetails({ open: true, loading: false, membership: renewed, error: '' })
      } else {
        await updateMembershipStatus(membership.id, nextStatus)
        toast.success('Membership status updated successfully.')
      }
      setConfirmation(null); setRefreshToken((value) => value + 1)
    } catch (error) { toast.error(getMembershipErrorMessage(error, toastMessage(error))) } finally { setRenewingId(null); setStatusUpdatingId(null) }
  }
  const emptyMessage = search || status !== 'all' ? (status === 'expired' && !search ? 'No expired memberships.' : status === 'cancelled' && !search ? 'No cancelled memberships.' : 'No memberships match your search.') : 'NO MEMBERSHIPS FOUND'

  return <div className="space-y-6"><MembershipFilters search={searchInput} status={status} onSearchChange={setSearchInput} onStatusChange={setStatus} onAddMembership={openCreate} />{pageError && <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="rounded-full border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 transition hover:bg-amber-100">Retry</button></div></div>}{loading ? <LoadingSkeleton /> : memberships.length === 0 ? <div className="rounded-3xl border border-ink/10 bg-white px-6 py-16 text-center shadow-[0_18px_60px_rgba(18,18,18,0.05)]"><p className="font-heading text-3xl uppercase tracking-wide text-ink">{emptyMessage}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">{pageError ? 'Try again when the Membership service is available.' : search || status !== 'all' ? 'Try a different search or status filter.' : 'Create a membership to start tracking a member’s plan and history.'}</p></div> : <><MembershipTable memberships={memberships} onView={openDetails} onEdit={openEdit} onRenew={(membership) => setConfirmation({ type: 'renew', membership })} onStatusChange={(membership, nextStatus) => { if (membership.status !== nextStatus) setConfirmation({ type: 'status', membership, nextStatus }) }} renewingId={renewingId} statusUpdatingId={statusUpdatingId} /><div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:flex-row sm:items-center sm:justify-between"><p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> Memberships</p><div className="flex items-center gap-2"><button type="button" disabled={pagination.current_page === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">Page {pagination.current_page} of {pagination.last_page}</span><button type="button" disabled={pagination.current_page === pagination.last_page} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></>}{modal.open && <MembershipModal open={modal.open} mode={modal.mode} loading={modal.loading} optionsLoading={optionsLoading} options={options} form={form} errors={formErrors} message={modal.message} saving={saving} onClose={closeModal} onSubmit={handleSubmit} onChange={handleChange} />}{details.open && <MembershipDetailsModal open={details.open} loading={details.loading} membership={details.membership} error={details.error} onClose={() => setDetails({ open: false, loading: false, membership: null, error: '' })} />}<ConfirmMembershipActionDialog action={confirmation} loading={Boolean(renewingId || statusUpdatingId)} onCancel={() => setConfirmation(null)} onConfirm={handleConfirm} /></div>
}
