import { Plus, Search } from 'lucide-react'
import { categories, conditions, labelize, maintenanceStatuses, statuses } from './equipmentUtils'

function SelectFilter({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent">
        <option value="all">{label}</option>
        {options.map((option) => <option key={option} value={option}>{labelize(option)}</option>)}
      </select>
    </label>
  )
}

export default function EquipmentFilters({ search, filters, onSearchChange, onFilterChange, onAddEquipment }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(18,18,18,0.06)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-ink/45">Equipment</p>
          <h1 className="mt-3 font-heading text-3xl uppercase tracking-wide text-ink sm:text-4xl">Equipment management</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink/55">Track gym equipment, current condition, operational status, and maintenance needs from one workspace.</p>
        </div>
        <button type="button" onClick={onAddEquipment} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-white hover:shadow-lg hover:shadow-accent/20"><Plus size={17} /> Add Equipment</button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_170px_170px_190px_200px]">
        <label className="relative block sm:col-span-2 xl:col-span-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 pl-11 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-accent" placeholder="Search name, code, brand, or model" aria-label="Search Equipment" />
        </label>
        <SelectFilter label="All Categories" value={filters.category} onChange={(value) => onFilterChange('category', value)} options={categories} />
        <SelectFilter label="All Conditions" value={filters.condition} onChange={(value) => onFilterChange('condition', value)} options={conditions} />
        <SelectFilter label="All Status" value={filters.status} onChange={(value) => onFilterChange('status', value)} options={statuses} />
        <SelectFilter label="All Maintenance" value={filters.maintenance_status} onChange={(value) => onFilterChange('maintenance_status', value)} options={maintenanceStatuses} />
      </div>
    </div>
  )
}
