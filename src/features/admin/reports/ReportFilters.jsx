import { CalendarDays, Filter, RefreshCw } from 'lucide-react'

const presets = [
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'last_7_days', label: 'Last 7 Days' },
  { key: 'last_30_days', label: 'Last 30 Days' },
]

export default function ReportFilters({ filters, draft, preset, error, loading, embedded = false, onPreset, onDraftChange, onApply }) {
  return (
    <section className={embedded ? '' : 'rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:p-6'}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-ink/45"><Filter size={15} /> Reporting filters</div>
          <p className="mt-2 text-sm text-ink/55">Choose a Manila calendar period for your operational reports.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((item) => <button key={item.key} type="button" onClick={() => onPreset(item.key)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${preset === item.key ? 'border-accent bg-accent text-ink' : 'border-ink/10 text-ink/60 hover:border-accent'}`}>{item.label}</button>)}
          <button type="button" onClick={() => onPreset('custom')} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${preset === 'custom' ? 'border-accent bg-accent text-ink' : 'border-ink/10 text-ink/60 hover:border-accent'}`}>Custom</button>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm font-medium text-ink/70">Date From<input type="date" value={draft.date_from} onChange={(event) => onDraftChange('date_from', event.target.value)} className="mt-2 block w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20" /></label>
        <label className="text-sm font-medium text-ink/70">Date To<input type="date" value={draft.date_to} onChange={(event) => onDraftChange('date_to', event.target.value)} className="mt-2 block w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20" /></label>
        <label className="text-sm font-medium text-ink/70">Group by<select value={draft.group_by} onChange={(event) => onDraftChange('group_by', event.target.value)} className="mt-2 block w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"><option value="day">Day</option><option value="month">Month</option></select></label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-ink/45"><CalendarDays size={14} className="mr-1 inline" />Selected: {filters.date_from} to {filters.date_to} · {filters.group_by === 'month' ? 'Monthly' : 'Daily'}</p><button type="button" onClick={onApply} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-accent transition hover:bg-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Apply filters</button></div>
      {error && <p className="mt-3 text-sm font-medium text-rose-700" role="alert">{error}</p>}
    </section>
  )
}
