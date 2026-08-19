import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import MemberFilters from './MemberFilters'
import MemberTable from './MemberTable'
import LoadingSkeleton from './LoadingSkeleton'
import EmptyState from './EmptyState'
import MemberModal from './MemberModal'
import {
  createMember,
  getMemberErrorMessage,
  getMemberMembershipOptions,
  getMemberStatusOptions,
  getMemberValidationErrors,
  listMembers,
  removeMember,
  updateMember,
} from '../../../services/memberService'
import { listTrainers } from '../../../services/trainerService'

const pageSize = 5

const initialForm = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  status: 'active',
  gender: '',
  date_of_birth: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  height: '',
  weight: '',
  trainer_id: null,
}

const buildFormFromMember = (member = {}) => ({
  name: member.name ?? '',
  email: member.email ?? '',
  password: '',
  password_confirmation: '',
  phone: member.phone ?? '',
  status: member.status ?? 'active',
  gender: member.gender ?? '',
  date_of_birth: member.date_of_birth ?? '',
  address: member.address ?? '',
  emergency_contact_name: member.emergency_contact_name ?? '',
  emergency_contact_phone: member.emergency_contact_phone ?? '',
  height: member.height ?? '',
  weight: member.weight ?? '',
  trainer_id: member.trainer_id ?? null,
})

const emptyPagination = {
  current_page: 1,
  last_page: 1,
  per_page: pageSize,
  total: 0,
  from: null,
  to: null,
}

const getToastMessageForError = (error) => {
  if (error?.isNetworkError) {
    return 'Unable to connect to the server.'
  }

  return 'Something went wrong.'
}

export default function MembersPage() {
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('All Memberships')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshToken, setRefreshToken] = useState(0)
  const [members, setMembers] = useState([])
  const [pagination, setPagination] = useState(emptyPagination)
  const [membershipOptions, setMembershipOptions] = useState(['All Memberships', 'No Membership'])
  const [statusOptions, setStatusOptions] = useState(['All Status', 'Active', 'Inactive', 'Suspended'])
  const [pageError, setPageError] = useState('')
  const [modalState, setModalState] = useState({ open: false, mode: 'create', member: null })
  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [modalMessage, setModalMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [trainers, setTrainers] = useState([])
  const [trainersLoading, setTrainersLoading] = useState(true)
  const [trainersError, setTrainersError] = useState('')

  useEffect(() => {
    let active = true

    const loadTrainers = async () => {
      setTrainersLoading(true)
      setTrainersError('')

      try {
        const trainerOptions = await listTrainers()
        if (active) setTrainers(trainerOptions)
      } catch (error) {
        if (!active) return
        setTrainers([])
        setTrainersError(error.message || 'Unable to load active Trainers.')
      } finally {
        if (active) setTrainersLoading(false)
      }
    }

    loadTrainers()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
    }, 250)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, membershipFilter, statusFilter])

  useEffect(() => {
    let active = true

    const loadMembers = async () => {
      setLoading(true)
      setPageError('')

      try {
        const response = await listMembers({
          page: currentPage,
          per_page: pageSize,
          search,
          status: statusFilter === 'All Status' ? 'all' : statusFilter.toLowerCase(),
          membership: membershipFilter === 'All Memberships' ? 'all' : membershipFilter,
        })

        if (!active) return

        const responseData = response.data?.data ?? {}

        setMembers(Array.isArray(responseData.data) ? responseData.data : [])
        setPagination(responseData.meta ?? emptyPagination)
        setMembershipOptions(getMemberMembershipOptions(responseData.filters?.memberships ?? ['No Membership']))
        setStatusOptions(getMemberStatusOptions(responseData.filters?.statuses ?? ['active', 'inactive', 'suspended']))
      } catch (error) {
        if (!active) return

        setPageError(getMemberErrorMessage(error, 'We could not load members right now.'))
        setMembers([])
        setPagination(emptyPagination)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadMembers()

    return () => {
      active = false
    }
  }, [currentPage, membershipFilter, refreshToken, search, statusFilter])

  useEffect(() => {
    if (currentPage > pagination.last_page) {
      setCurrentPage(pagination.last_page)
    }
  }, [currentPage, pagination.last_page])

  const openMemberModal = (mode, member = null) => {
    setFormErrors({})
    setModalMessage('')
    setModalState({ open: true, mode, member })
    setForm(mode === 'create' ? initialForm : buildFormFromMember(member))
  }

  const closeMemberModal = () => {
    setModalState({ open: false, mode: 'create', member: null })
    setForm(initialForm)
    setFormErrors({})
    setModalMessage('')
    setSaving(false)
    setDeleting(false)
  }

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setMembershipFilter('All Memberships')
    setStatusFilter('All Status')
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => ({ ...current, [name]: null }))
    setModalMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormErrors({})
    setModalMessage('')

    try {
      const payload = {
        ...form,
        trainer_id: form.trainer_id === '' || form.trainer_id == null ? null : Number(form.trainer_id),
      }

      if (modalState.mode === 'edit' && modalState.member) {
        await updateMember(modalState.member.id, payload)
        closeMemberModal()
        setRefreshToken((value) => value + 1)
        toast.success('Member updated successfully.')
      } else {
        await createMember(payload)
        closeMemberModal()
        setRefreshToken((value) => value + 1)
        toast.success('Member created successfully.')
      }
    } catch (error) {
      const validationErrors = getMemberValidationErrors(error)

      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors)
        setModalMessage('Please fix the highlighted fields.')
        toast('Please fix the highlighted fields.', {
          icon: '!',
        })
        return
      }

      setModalMessage(getMemberErrorMessage(error, 'Unable to save the member.'))
      toast.error(getToastMessageForError(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!modalState.member) {
      return
    }

    setDeleting(true)
    setModalMessage('')

    try {
      await removeMember(modalState.member.id)
      closeMemberModal()
      setRefreshToken((value) => value + 1)
      toast.success('Member deleted successfully.')
    } catch (error) {
      setModalMessage(getMemberErrorMessage(error, 'Unable to delete the member.'))
      toast.error(getToastMessageForError(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <MemberFilters
        search={searchInput}
        membershipFilter={membershipFilter}
        statusFilter={statusFilter}
        membershipOptions={membershipOptions}
        statusOptions={statusOptions}
        onSearchChange={setSearchInput}
        onMembershipChange={setMembershipFilter}
        onStatusChange={setStatusFilter}
        onAddMember={() => openMemberModal('create')}
      />

      {pageError && !members.length && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900 shadow-[0_18px_60px_rgba(18,18,18,0.05)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{pageError}</p>
            <button
              type="button"
              onClick={() => setRefreshToken((value) => value + 1)}
              className="rounded-full border border-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 transition hover:bg-amber-100"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : members.length === 0 ? (
        pageError ? null : <EmptyState onReset={resetFilters} />
      ) : (
        <>
          <MemberTable members={members} onAction={openMemberModal} />

          <div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing <span className="font-semibold text-ink">{pagination.from ?? 0}</span> to{' '}
              <span className="font-semibold text-ink">{pagination.to ?? 0}</span> of{' '}
              <span className="font-semibold text-ink">{pagination.total}</span> members
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.current_page === 1}
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                type="button"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setCurrentPage((value) => Math.min(pagination.last_page, value + 1))}
                className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <MemberModal
        open={modalState.open}
        mode={modalState.mode}
        member={modalState.member}
        form={form}
        errors={formErrors}
        message={modalMessage}
        saving={saving}
        deleting={deleting}
        onClose={closeMemberModal}
        onSubmit={handleSubmit}
        onEdit={() => openMemberModal('edit', modalState.member)}
        onDelete={handleDelete}
        onChange={handleFieldChange}
        trainers={trainers}
        trainersLoading={trainersLoading}
        trainersError={trainersError}
      />
    </div>
  )
}
