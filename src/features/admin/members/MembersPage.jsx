import { useEffect, useMemo, useState } from 'react'
import MemberFilters from './MemberFilters'
import MemberTable from './MemberTable'
import LoadingSkeleton from './LoadingSkeleton'
import EmptyState from './EmptyState'
import MemberModal from './MemberModal'
import { members as seedMembers } from './data'

const pageSize = 5

export default function MembersPage() {
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('All Memberships')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState({ open: false, action: 'create', member: null })

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700)
    return () => window.clearTimeout(timer)
  }, [])

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return seedMembers.filter((member) => {
      const matchesSearch =
        !query ||
        [member.name, member.code, member.email, member.phone].some((value) => value.toLowerCase().includes(query))

      const matchesMembership =
        membershipFilter === 'All Memberships' || member.membership === membershipFilter
      const matchesStatus = statusFilter === 'All Status' || member.status === statusFilter

      return matchesSearch && matchesMembership && matchesStatus
    })
  }, [membershipFilter, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize))
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, membershipFilter, statusFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const openMemberModal = (action, member = null) => {
    setModalState({ open: true, action, member })
  }

  const closeMemberModal = () => setModalState({ open: false, action: 'create', member: null })

  const resetFilters = () => {
    setSearch('')
    setMembershipFilter('All Memberships')
    setStatusFilter('All Status')
  }

  return (
    <div className="space-y-6">
      <MemberFilters
        search={search}
        membershipFilter={membershipFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onMembershipChange={setMembershipFilter}
        onStatusChange={setStatusFilter}
        onAddMember={() => openMemberModal('create')}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : filteredMembers.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <>
          <MemberTable members={paginatedMembers} onAction={openMemberModal} />

          <div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing <span className="font-semibold text-ink">{paginatedMembers.length}</span> of{' '}
              <span className="font-semibold text-ink">{filteredMembers.length}</span> members
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
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
        member={modalState.member}
        action={modalState.action}
        onClose={closeMemberModal}
      />
    </div>
  )
}
