import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import MaintenanceDetailsModal from './MaintenanceDetailsModal'
import MaintenanceFilters from './MaintenanceFilters'
import MaintenanceModal from './MaintenanceModal'
import MaintenanceTable from './MaintenanceTable'
import EmptyState from './EmptyState'
import LoadingSkeleton from './LoadingSkeleton'
import {
  buildMaintenanceForm,
  buildMaintenancePayload,
  emptyMaintenanceForm,
} from './maintenanceUtils'
import {
  createMaintenance,
  getMaintenanceErrorMessage,
  getMaintenanceValidationErrors,
  listAdminMaintenance,
  listMaintenanceEquipment,
  showAdminMaintenance,
  updateMaintenance,
} from '../../../services/adminMaintenanceService'

const pageSize = 10
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const initialFilters = { equipment_id: 'all', maintenance_type: 'all', status: 'all', date_from: '', date_to: '' }

export default function MaintenancePage() {
  const [records, setRecords] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState('')
  const [pageError, setPageError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(emptyPagination)
  const [refreshToken, setRefreshToken] = useState(0)
  const [modal, setModal] = useState({ open: false, mode: 'create', recordId: null, message: '' })
  const [form, setForm] = useState(emptyMaintenanceForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [details, setDetails] = useState({ open: false, loading: false, record: null, error: '' })

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 250)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let active = true
    setOptionsLoading(true)
    listMaintenanceEquipment()
      .then((items) => { if (active) setEquipment(items) })
      .catch((error) => { if (active) setOptionsError(getMaintenanceErrorMessage(error, 'Unable to load Equipment options.')) })
      .finally(() => { if (active) setOptionsLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filters.equipment_id, filters.maintenance_type, filters.status, filters.date_from, filters.date_to])

  useEffect(() => {
    let active = true
    const loadRecords = async () => {
      setLoading(true)
      setPageError('')
      try {
        const result = await listAdminMaintenance({ page: currentPage, per_page: pageSize, search, ...filters })
        if (!active) return
        setRecords(result.records)
        setPagination(result.pagination || emptyPagination)
      } catch (error) {
        if (!active) return
        setRecords([])
        setPagination(emptyPagination)
        setPageError(getMaintenanceErrorMessage(error, 'We could not load Maintenance right now.'))
      } finally {
        if (active) setLoading(false)
      }
    }
    loadRecords()
    return () => { active = false }
  }, [currentPage, refreshToken, search, filters])

  useEffect(() => {
    if (currentPage > pagination.last_page) setCurrentPage(pagination.last_page || 1)
  }, [currentPage, pagination.last_page])

  const closeModal = () => {
    setModal({ open: false, mode: 'create', recordId: null, message: '' })
    setForm(emptyMaintenanceForm)
    setFormErrors({})
    setSaving(false)
  }

  const openCreate = () => {
    setForm(emptyMaintenanceForm)
    setFormErrors({})
    setModal({ open: true, mode: 'create', recordId: null, message: '' })
  }

  const openEdit = (record) => {
    setDetails({ open: false, loading: false, record: null, error: '' })
    setForm(buildMaintenanceForm(record))
    setFormErrors({})
    setModal({ open: true, mode: 'edit', recordId: record.id, message: '' })
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
      const payload = buildMaintenancePayload(form)
      if (modal.mode === 'edit') {
        await updateMaintenance(modal.recordId, payload)
        toast.success('Maintenance record updated successfully.')
      } else {
        await createMaintenance(payload)
        toast.success('Maintenance record created successfully.')
      }
      closeModal()
      setRefreshToken((value) => value + 1)
    } catch (error) {
      const validationErrors = getMaintenanceValidationErrors(error)
      if (Object.keys(validationErrors).length) {
        setFormErrors(validationErrors)
        setModal((current) => ({ ...current, message: 'Please fix the highlighted fields.' }))
        toast('Please fix the highlighted fields.', { icon: '!' })
      } else {
        setModal((current) => ({ ...current, message: getMaintenanceErrorMessage(error, 'Unable to save the maintenance record.') }))
        toast.error(getMaintenanceErrorMessage(error))
      }
    } finally {
      setSaving(false)
    }
  }

  const openDetails = async (record) => {
    setDetails({ open: true, loading: true, record: null, error: '' })
    try {
      const selectedRecord = await showAdminMaintenance(record.id)
      setDetails({ open: true, loading: false, record: selectedRecord, error: '' })
    } catch (error) {
      setDetails({ open: true, loading: false, record: null, error: getMaintenanceErrorMessage(error, 'Unable to load Maintenance details.') })
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const filtered = Boolean(search || filters.equipment_id !== 'all' || filters.maintenance_type !== 'all' || filters.status !== 'all' || filters.date_from || filters.date_to)

  return <div className="space-y-6"><MaintenanceFilters search={searchInput} filters={filters} equipment={equipment} onSearchChange={setSearchInput} onFilterChange={handleFilterChange} onAdd={openCreate} />{optionsError && <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">{optionsError}</div>}{pageError && <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="rounded-full border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 transition hover:bg-amber-100">Retry</button></div></div>}{loading ? <LoadingSkeleton /> : records.length === 0 ? <EmptyState filtered={filtered} /> : <><MaintenanceTable records={records} onView={openDetails} onEdit={openEdit} /><div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:flex-row sm:items-center sm:justify-between"><p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> Maintenance records</p><div className="flex items-center gap-2"><button type="button" disabled={pagination.current_page === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">Page {pagination.current_page} of {pagination.last_page}</span><button type="button" disabled={pagination.current_page === pagination.last_page} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></>}{modal.open && <MaintenanceModal open={modal.open} mode={modal.mode} form={form} equipment={equipment} equipmentLoading={optionsLoading} equipmentError={optionsError} errors={formErrors} message={modal.message} saving={saving} onClose={closeModal} onSubmit={handleSubmit} onChange={handleChange} />}{details.open && <MaintenanceDetailsModal open={details.open} loading={details.loading} record={details.record} error={details.error} onClose={() => setDetails({ open: false, loading: false, record: null, error: '' })} onEdit={openEdit} />}</div>
}
