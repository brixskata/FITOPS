import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import Button from '../../../components/common/Button'

export default function AttendanceFilters({
  search,
  memberId,
  trainerId,
  dateFrom,
  dateTo,
  sessionState,
  members,
  trainers,
  optionsLoading,
  optionsError,
  onSearchChange,
  onMemberChange,
  onTrainerChange,
  onDateFromChange,
  onDateToChange,
  onSessionStateChange,
  onClear,
  onCheckIn,
}) {
  const hasFilters = search || memberId || trainerId || dateFrom || dateTo || sessionState !== 'all'

  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Admin workspace</p>
          <h1 className="mt-2 font-heading text-4xl uppercase tracking-wide text-ink">Attendance</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">Review gym visits and manage Member check-in and check-out sessions.</p>
        </div>
        <Button type="button" onClick={onCheckIn} className="h-11 whitespace-nowrap">
          <Plus size={16} /> Check In
        </Button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_minmax(180px,1fr)_minmax(180px,1fr)_150px_150px_160px]">
        <label className="relative block">
          <span className="sr-only">Search attendance by Member</span>
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search Member name or email" className="h-11 w-full rounded-2xl border border-ink/10 bg-white pl-11 pr-4 text-sm text-ink outline-none transition focus:border-accent" />
        </label>
        <select value={memberId} onChange={(event) => onMemberChange(event.target.value)} disabled={optionsLoading} aria-label="Filter attendance by Member" className="h-11 rounded-2xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-accent disabled:opacity-60">
          <option value="">{optionsLoading ? 'Loading Members...' : 'All Members'}</option>
          {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
        </select>
        <select value={trainerId} onChange={(event) => onTrainerChange(event.target.value)} disabled={optionsLoading} aria-label="Filter by current Trainer assignment" className="h-11 rounded-2xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-accent disabled:opacity-60">
          <option value="">{optionsLoading ? 'Loading Trainers...' : 'All Trainers'}</option>
          {trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.name}</option>)}
        </select>
        <label><span className="sr-only">Attendance date from</span><input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} className="h-11 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-accent" /></label>
        <label><span className="sr-only">Attendance date to</span><input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => onDateToChange(event.target.value)} className="h-11 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-accent" /></label>
        <select value={sessionState} onChange={(event) => onSessionStateChange(event.target.value)} aria-label="Filter by session state" className="h-11 rounded-2xl border border-ink/10 bg-white px-4 text-sm font-medium text-ink outline-none transition focus:border-accent">
          <option value="all">All sessions</option>
          <option value="open">Open</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="mt-3 flex flex-col gap-2 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between">
        <p>{optionsError || 'Dates are interpreted using the Philippine calendar. Trainer filtering uses each Member’s current assignment.'}</p>
        {hasFilters && <button type="button" onClick={onClear} className="inline-flex items-center gap-2 self-start font-bold uppercase tracking-wider text-ink transition hover:text-ink/60 sm:self-auto"><SlidersHorizontal size={14} /> Clear filters</button>}
      </div>
    </div>
  )
}
