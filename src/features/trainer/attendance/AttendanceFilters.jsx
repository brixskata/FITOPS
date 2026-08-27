import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'

const inputClassName = 'mt-2 w-full rounded-xl border border-ink/10 bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20'

export default function AttendanceFilters({ search, filters, members, membersLoading, memberOptionsError, loading, hasActiveFilters, onSearchChange, onFilterChange, onClear }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_16px_50px_rgba(18,18,18,0.04)] sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-ink"><SlidersHorizontal size={18} /></span>
        <div><h2 className="text-sm font-bold text-ink">Attendance filters</h2><p className="mt-0.5 text-xs text-ink/45">Search and review your current roster’s visit history.</p></div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <label className="min-w-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45 md:col-span-2 lg:col-span-1">
          Search Members
          <span className="relative block"><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" /><input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Name, email, or member code" className={`${inputClassName} pl-10`} /></span>
        </label>
        <label className="min-w-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          Member
          <select value={filters.member_id} onChange={(event) => onFilterChange('member_id', event.target.value)} disabled={membersLoading} className={inputClassName}>
            <option value="">All assigned members</option>
            {members.map((member) => <option key={member.id} value={member.id}>{member.name || member.member_code || `Member ${member.id}`}</option>)}
          </select>
          {membersLoading && <span className="mt-1 block text-[11px] normal-case tracking-normal text-ink/40">Loading your roster…</span>}
          {!membersLoading && memberOptionsError && <span className="mt-1 block text-[11px] normal-case tracking-normal text-amber-700">Roster filter unavailable right now.</span>}
        </label>
        <label className="min-w-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          Date From
          <input type="date" value={filters.date_from} onChange={(event) => onFilterChange('date_from', event.target.value)} className={inputClassName} />
        </label>
        <label className="min-w-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          Date To
          <input type="date" value={filters.date_to} onChange={(event) => onFilterChange('date_to', event.target.value)} min={filters.date_from || undefined} className={inputClassName} />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/45 sm:max-w-xs">
          Session State
          <select value={filters.session_state} onChange={(event) => onFilterChange('session_state', event.target.value)} className={inputClassName}>
            <option value="all">All sessions</option><option value="open">Open</option><option value="completed">Completed</option>
          </select>
        </label>
        <button type="button" onClick={onClear} disabled={!hasActiveFilters || loading} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-ink/10 px-4 text-xs font-bold uppercase tracking-[0.12em] text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40 sm:self-end"><RotateCcw size={15} /> Clear filters</button>
      </div>
    </section>
  )
}
