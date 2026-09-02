import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmRetireDialog from './ConfirmRetireDialog'
import EquipmentDetailsModal from './EquipmentDetailsModal'
import EquipmentFilters from './EquipmentFilters'
import EquipmentModal from './EquipmentModal'
import EquipmentTable from './EquipmentTable'
import EmptyState from './EmptyState'
import LoadingSkeleton from './LoadingSkeleton'
import {
  buildEquipmentForm,
  buildEquipmentPayload,
  emptyEquipmentForm,
} from './equipmentUtils'
import {
  createEquipment,
  getEquipmentErrorMessage,
  getEquipmentValidationErrors,
  listAdminEquipment,
  showAdminEquipment,
  updateEquipment,
} from '../../../services/adminEquipmentService'

const pageSize = 10
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const initialFilters = { category: 'all', condition: 'all', status: 'all', maintenance_status: 'all' }

const getToastMessage = (error) => error?.isNetworkError ? 'Unable to connect to the server.' : 'Something went wrong.'

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(emptyPagination)
  const [refreshToken, setRefreshToken] = useState(0)
  const [modal, setModal] = useState({ open: false, mode: 'create', message: '' })
  const [form, setForm] = useState(emptyEquipmentForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [retiringId, setRetiringId] = useState(null)
  const [retireTarget, setRetireTarget] = useState(null)
  const [details, setDetails] = useState({ open: false, loading: false, equipment: null, error: '' })

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 250)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filters.category, filters.condition, filters.status, filters.maintenance_status])

  useEffect(() => {
    let active = true

    const loadEquipment = async () => {
      setLoading(true)
      setPageError('')

      try {
        const result = await listAdminEquipment({
          page: currentPage,
          per_page: pageSize,
          search,
          ...filters,
        })

        if (!active) return
        setEquipment(result.equipment)
        setPagination(result.pagination || emptyPagination)
      } catch (error) {
        if (!active) return
        setEquipment([])
        setPagination(emptyPagination)
        setPageError(getEquipmentErrorMessage(error, 'We could not load Equipment right now.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEquipment()
    return () => { active = false }
  }, [currentPage, refreshToken, search, filters])

  useEffect(() => {
    if (currentPage > pagination.last_page) setCurrentPage(pagination.last_page || 1)
  }, [currentPage, pagination.last_page])

  const closeModal = () => {
    setModal({ open: false, mode: 'create', message: '' })
    setForm(emptyEquipmentForm)
    setFormErrors({})
    setSaving(false)
  }

  const openCreate = () => {
    setForm(emptyEquipmentForm)
    setFormErrors({})
    setModal({ open: true, mode: 'create', message: '' })
  }

  const openEdit = (item) => {
    setDetails({ open: false, loading: false, equipment: null, error: '' })
    setForm(buildEquipmentForm(item))
    setFormErrors({})
    setModal({ open: true, mode: 'edit', equipmentId: item.id, message: '' })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => ({ ...current, [name]: null }))
    setModal((current) => ({ ...current, message: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormErrors({})
    setModal((current) => ({ ...current, message: '' }))

    try {
      const payload = buildEquipmentPayload(form)
      if (modal.mode === 'edit') {
        await updateEquipment(modal.equipmentId, payload)
        toast.success('Equipment updated successfully.')
      } else {
        await createEquipment(payload)
        toast.success('Equipment created successfully.')
      }
      closeModal()
      setRefreshToken((value) => value + 1)
    } catch (error) {
      const validationErrors = getEquipmentValidationErrors(error)
      if (Object.keys(validationErrors).length) {
        setFormErrors(validationErrors)
        setModal((current) => ({ ...current, message: 'Please fix the highlighted fields.' }))
        toast('Please fix the highlighted fields.', { icon: '!' })
      } else {
        setModal((current) => ({ ...current, message: getEquipmentErrorMessage(error, 'Unable to save the Equipment.') }))
        toast.error(getToastMessage(error))
      }
    } finally {
      setSaving(false)
    }
  }

  const openDetails = async (item) => {
    setDetails({ open: true, loading: true, equipment: null, error: '' })
    try {
      const selectedEquipment = await showAdminEquipment(item.id)
      setDetails({ open: true, loading: false, equipment: selectedEquipment, error: '' })
    } catch (error) {
      setDetails({ open: true, loading: false, equipment: null, error: getEquipmentErrorMessage(error, 'Unable to load Equipment details.') })
    }
  }

  const retireEquipment = async () => {
    if (!retireTarget) return

    setRetiringId(retireTarget.id)
    try {
      await updateEquipment(retireTarget.id, { ...buildEquipmentPayload(buildEquipmentForm(retireTarget)), status: 'retired' })
      toast.success('Equipment retired successfully.')
      setRetireTarget(null)
      setRefreshToken((value) => value + 1)
    } catch (error) {
      toast.error(getEquipmentErrorMessage(error, 'Unable to retire the Equipment.'))
    } finally {
      setRetiringId(null)
    }
  }

  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }))
  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setFilters(initialFilters)
  }
  const hasFilters = Boolean(search || Object.values(filters).some((value) => value !== 'all'))
  const emptyMessage = pageError || !hasFilters ? '' : 'filtered'

  return (
    <div className="space-y-6">
      <EquipmentFilters search={searchInput} filters={filters} onSearchChange={setSearchInput} onFilterChange={updateFilter} onAddEquipment={openCreate} />

      {pageError && <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="rounded-full border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 transition hover:bg-amber-100">Retry</button></div></div>}

      {loading ? <LoadingSkeleton /> : equipment.length === 0 ? (
        <EmptyState filtered={emptyMessage === 'filtered'} onReset={resetFilters} onAddEquipment={openCreate} />
      ) : (
        <>
          <EquipmentTable equipment={equipment} onView={openDetails} onEdit={openEdit} onRetire={setRetireTarget} retiringId={retiringId} />
          <div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:flex-row sm:items-center sm:justify-between">
            <p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> Equipment</p>
            <div className="flex items-center gap-2">
              <button type="button" disabled={pagination.current_page === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <span className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">Page {pagination.current_page} of {pagination.last_page}</span>
              <button type="button" disabled={pagination.current_page === pagination.last_page} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        </>
      )}

      <EquipmentModal open={modal.open} mode={modal.mode} form={form} errors={formErrors} message={modal.message} saving={saving} onClose={closeModal} onSubmit={handleSubmit} onChange={handleChange} />
      <EquipmentDetailsModal open={details.open} loading={details.loading} equipment={details.equipment} error={details.error} onClose={() => setDetails({ open: false, loading: false, equipment: null, error: '' })} onEdit={openEdit} />
      <ConfirmRetireDialog equipment={retireTarget} loading={retiringId !== null} onCancel={() => setRetireTarget(null)} onConfirm={retireEquipment} />
    </div>
  )
}
