import { RotateCcw, SlidersHorizontal } from 'lucide-react'

const inputClassName = 'mt-2 w-full rounded-xl border border-ink/10 bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20'

export default function AttendanceFilters({ filters, loading, hasActiveFilters, onChange, onApply, onClear }) {
  return (
    <form onSubmit={onApply} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_16px_50px_rgba(18,18,18,0.04)] sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-ink">
          <SlidersHorizontal size={18} />
        </span>
        <div>
          <h2 className="text-sm font-bold text-ink">Filter visit history</h2>
          <p className="mt-0.5 text-xs text-ink/45">Dates follow Philippine calendar days.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
        <label className="min-w-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          Date From
          <input type="date" value={filters.date_from} max={filters.date_to || undefined} onChange={(event) => onChange('date_from', event.target.value)} className={inputClassName} />
        </label>
        <label className="min-w-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          Date To
          <input type="date" value={filters.date_to} min={filters.date_from || undefined} onChange={(event) => onChange('date_to', event.target.value)} className={inputClassName} />
        </label>
        <label className="min-w-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          Session State
          <select value={filters.session_state} onChange={(event) => onChange('session_state', event.target.value)} className={inputClassName}>
            <option value="all">All sessions</option>
            <option value="open">Open</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <button type="submit" disabled={loading} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-ink px-5 text-xs font-bold uppercase tracking-[0.14em] text-accent transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none">
            {loading ? 'Applying…' : 'Apply'}
          </button>
          <button type="button" onClick={onClear} disabled={!hasActiveFilters || loading} aria-label="Clear attendance filters" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/10 px-4 text-xs font-bold uppercase tracking-[0.12em] text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">
            <RotateCcw size={15} /> <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>
    </form>
  )
}
