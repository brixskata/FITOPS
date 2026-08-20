import { Search } from 'lucide-react'

export default function TrainerFilters({ search, status, onSearchChange, onStatusChange, onAddTrainer }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(18,18,18,0.06)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-ink/45">Trainers</p>
          <h1 className="mt-3 font-heading text-3xl uppercase tracking-wide text-ink sm:text-4xl">Trainer management</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink/55">Manage coaching profiles, availability, and assigned-member visibility from one workspace.</p>
        </div>
        <button type="button" onClick={onAddTrainer} className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-white hover:shadow-lg hover:shadow-accent/20">
          + Add Trainer
        </button>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative block">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 pl-11 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-accent" placeholder="Search name, employee code, or specialization" aria-label="Search Trainers" />
        </label>
        <label className="block">
          <span className="sr-only">Filter by status</span>
          <select value={status} onChange={(event) => onStatusChange(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" aria-label="Filter Trainers by status">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>
    </div>
  )
}
