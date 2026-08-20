import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import TrainerFilters from './TrainerFilters'
import TrainerTable from './TrainerTable'
import LoadingSkeleton from './LoadingSkeleton'
import TrainerModal from './TrainerModal'
import TrainerDetailsModal from './TrainerDetailsModal'
import ConfirmStatusDialog from './ConfirmStatusDialog'
import {
  createTrainer,
  getTrainerErrorMessage,
  getTrainerValidationErrors,
  listAdminTrainers,
  showAdminTrainer,
  updateTrainer,
  updateTrainerStatus,
} from '../../../services/adminTrainerService'

const pageSize = 10
const emptyPagination = { current_page: 1, last_page: 1, per_page: pageSize, total: 0, from: null, to: null }
const emptyForm = { name: '', email: '', password: '', password_confirmation: '', employee_code: '', specialization: '', biography: '', experience_years: '', hire_date: '', status: 'active' }

const buildForm = (trainer = {}) => ({
  name: trainer.name ?? '', email: trainer.email ?? '', password: '', password_confirmation: '', employee_code: trainer.employee_code ?? '', specialization: trainer.specialization ?? '', biography: trainer.biography ?? '', experience_years: trainer.experience_years ?? '', hire_date: trainer.hire_date ?? '', status: trainer.status ?? 'active',
})

const getToastMessage = (error) => error?.isNetworkError ? 'Unable to connect to the server.' : 'Something went wrong.'

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(emptyPagination)
  const [refreshToken, setRefreshToken] = useState(0)
  const [modal, setModal] = useState({ open: false, mode: 'create', loading: false, message: '' })
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [details, setDetails] = useState({ open: false, loading: false, trainer: null, error: '' })
  const [statusConfirmation, setStatusConfirmation] = useState(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 250)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => setCurrentPage(1), [search, status])

  useEffect(() => {
    let active = true

    const loadTrainers = async () => {
      setLoading(true)
      setPageError('')
      try {
        const response = await listAdminTrainers({ page: currentPage, per_page: pageSize, search, status })
        if (!active) return
        setTrainers(response.trainers)
        setPagination(response.pagination || emptyPagination)
      } catch (error) {
        if (!active) return
        setTrainers([])
        setPagination(emptyPagination)
        setPageError(getTrainerErrorMessage(error, 'We could not load Trainers right now.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadTrainers()
    return () => { active = false }
  }, [currentPage, refreshToken, search, status])

  useEffect(() => {
    if (currentPage > pagination.last_page) setCurrentPage(pagination.last_page || 1)
  }, [currentPage, pagination.last_page])

  const closeModal = () => {
    setModal({ open: false, mode: 'create', loading: false, message: '' })
    setForm(emptyForm)
    setFormErrors({})
    setSaving(false)
  }

  const openCreate = () => {
    setForm(emptyForm)
    setFormErrors({})
    setModal({ open: true, mode: 'create', loading: false, message: '' })
  }

  const openEdit = async (trainer) => {
    setFormErrors({})
    setForm(buildForm(trainer))
    setModal({ open: true, mode: 'edit', trainerId: trainer.id, loading: true, message: '' })
    try {
      const selectedTrainer = await showAdminTrainer(trainer.id)
      setForm(buildForm(selectedTrainer))
      setModal((current) => ({ ...current, loading: false }))
    } catch (error) {
      setModal((current) => ({ ...current, loading: false, message: getTrainerErrorMessage(error, 'Unable to load the Trainer.') }))
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => ({ ...current, [name]: null, ...(name === 'biography' ? { bio: null } : {}) }))
    setModal((current) => ({ ...current, message: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormErrors({})
    setModal((current) => ({ ...current, message: '' }))

    const payload = {
      name: form.name,
      email: form.email,
      specialization: form.specialization || null,
      bio: form.biography || null,
      experience_years: form.experience_years === '' ? null : Number(form.experience_years),
      hire_date: form.hire_date || null,
      status: form.status,
      ...(form.password ? { password: form.password, password_confirmation: form.password_confirmation } : {}),
    }

    try {
      if (modal.mode === 'edit' && modal.trainerId) {
        await updateTrainer(modal.trainerId, payload)
        toast.success('Trainer updated successfully.')
      } else {
        await createTrainer({ ...payload, password: form.password, password_confirmation: form.password_confirmation })
        toast.success('Trainer created successfully.')
      }
      closeModal()
      setRefreshToken((value) => value + 1)
    } catch (error) {
      const validationErrors = getTrainerValidationErrors(error)
      if (Object.keys(validationErrors).length) {
        setFormErrors(validationErrors)
        setModal((current) => ({ ...current, message: 'Please fix the highlighted fields.' }))
        toast('Please fix the highlighted fields.', { icon: '!' })
      } else {
        setModal((current) => ({ ...current, message: getTrainerErrorMessage(error, 'Unable to save the Trainer.') }))
        toast.error(getToastMessage(error))
      }
    } finally {
      setSaving(false)
    }
  }

  const openDetails = async (trainer) => {
    setDetails({ open: true, loading: true, trainer: null, error: '' })
    try {
      const selectedTrainer = await showAdminTrainer(trainer.id)
      setDetails({ open: true, loading: false, trainer: selectedTrainer, error: '' })
    } catch (error) {
      setDetails({ open: true, loading: false, trainer: null, error: getTrainerErrorMessage(error, 'Unable to load Trainer details.') })
    }
  }

  const confirmStatusChange = (trainer) => setStatusConfirmation({ trainer, nextStatus: trainer.status === 'active' ? 'inactive' : 'active' })

  const handleStatusChange = async () => {
    if (!statusConfirmation) return
    const { trainer, nextStatus } = statusConfirmation
    setStatusUpdatingId(trainer.id)
    try {
      const updatedTrainer = await updateTrainerStatus(trainer.id, nextStatus)
      setTrainers((current) => current.map((item) => item.id === trainer.id ? updatedTrainer : item).filter((item) => status === 'all' || item.status === status))
      toast.success(`Trainer ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully.`)
      setStatusConfirmation(null)
    } catch (error) {
      toast.error(getToastMessage(error))
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const emptyMessage = search || status !== 'all' ? (status === 'inactive' && !search ? 'No inactive trainers.' : 'No trainers match your search.') : 'NO TRAINERS FOUND'

  return <div className="space-y-6"><TrainerFilters search={searchInput} status={status} onSearchChange={setSearchInput} onStatusChange={setStatus} onAddTrainer={openCreate} />{pageError && <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>{pageError}</p><button type="button" onClick={() => setRefreshToken((value) => value + 1)} className="rounded-full border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 transition hover:bg-amber-100">Retry</button></div></div>}{loading ? <LoadingSkeleton /> : trainers.length === 0 ? <div className="rounded-3xl border border-ink/10 bg-white px-6 py-16 text-center shadow-[0_18px_60px_rgba(18,18,18,0.05)]"><p className="font-heading text-3xl uppercase tracking-wide text-ink">{emptyMessage}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">{pageError ? 'Try again when the Trainer service is available.' : status === 'all' && !search ? 'Add a Trainer profile to start managing your coaching team.' : 'Try a different search or status filter.'}</p></div> : <><TrainerTable trainers={trainers} onView={openDetails} onEdit={openEdit} onToggleStatus={confirmStatusChange} statusUpdatingId={statusUpdatingId} /><div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:flex-row sm:items-center sm:justify-between"><p>Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of <span className="font-semibold text-ink">{pagination.total ?? 0}</span> Trainers</p><div className="flex items-center gap-2"><button type="button" disabled={pagination.current_page === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">Page {pagination.current_page} of {pagination.last_page}</span><button type="button" disabled={pagination.current_page === pagination.last_page} onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></>}{modal.open && <TrainerModal open={modal.open} mode={modal.mode} loading={modal.loading} form={form} errors={formErrors} message={modal.message} saving={saving} onClose={closeModal} onSubmit={handleSubmit} onChange={handleChange} />}{details.open && <TrainerDetailsModal open={details.open} loading={details.loading} trainer={details.trainer} error={details.error} onClose={() => setDetails({ open: false, loading: false, trainer: null, error: '' })} />}<ConfirmStatusDialog trainer={statusConfirmation?.trainer} nextStatus={statusConfirmation?.nextStatus} loading={Boolean(statusUpdatingId)} onCancel={() => setStatusConfirmation(null)} onConfirm={handleStatusChange} /></div>
}
