import { Plus, Search } from 'lucide-react'
import { categories, conditions, labelize, maintenanceStatuses, statuses } from './equipmentUtils'

function SelectFilter({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="w-full min-w-0 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent">
        <option value="all">{label}</option>
        {options.map((option) => <option key={option} value={option}>{labelize(option)}</option>)}
      </select>
    </label>
  )
}

export default function EquipmentFilters({ search, filters, onSearchChange, onFilterChange, onAddEquipment }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(18,18,18,0.06)] sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[minmax(0,1fr)_170px_170px_190px_200px_auto]">
        <button type="button" onClick={onAddEquipment} className="order-first inline-flex min-w-0 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 sm:col-span-2 lg:order-last lg:col-span-1 2xl:order-last 2xl:col-span-1"><Plus size={17} /> Add Equipment</button>
        <label className="relative block min-w-0 sm:col-span-2 lg:col-span-2 2xl:col-span-1">
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
