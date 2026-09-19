import { Plus, Search } from 'lucide-react'
import { labelForStatus, labelForType, maintenanceStatuses, maintenanceTypes } from './maintenanceUtils'

function SelectFilter({ label, value, onChange, options, labels }) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="w-full min-w-0 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent">
        <option value="all">{label}</option>
        {options.map((option) => <option key={option} value={option}>{labels(option)}</option>)}
      </select>
    </label>
  )
}

export default function MaintenanceFilters({ search, filters, equipment, onSearchChange, onFilterChange, onAdd }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(18,18,18,0.06)] sm:p-6">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_150px_150px_minmax(215px,auto)]">
        <button type="button" onClick={onAdd} className="order-first inline-flex min-w-[215px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-4 py-3 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 sm:col-span-2 lg:order-last lg:col-span-1 xl:order-last xl:col-span-1"><Plus size={17} className="shrink-0" /> Add Maintenance</button>
        <label className="relative block min-w-0 sm:col-span-2 lg:col-span-2 xl:col-span-1"><span className="sr-only">Search equipment or maintenance</span><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" /><input value={search} onChange={(event) => onSearchChange(event.target.value)} className="h-11 w-full min-w-0 rounded-2xl border border-ink/10 bg-white px-4 py-0 pl-11 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-accent" placeholder="Search equipment or maintenance" aria-label="Search Maintenance" /></label>
        <label className="block min-w-0"><span className="sr-only">All Equipment</span><select value={filters.equipment_id} onChange={(event) => onFilterChange('equipment_id', event.target.value)} aria-label="Filter by Equipment" className="w-full min-w-0 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"><option value="all">All Equipment</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.asset_code})</option>)}</select></label>
        <SelectFilter label="All Types" value={filters.maintenance_type} onChange={(value) => onFilterChange('maintenance_type', value)} options={maintenanceTypes} labels={labelForType} />
        <SelectFilter label="All Statuses" value={filters.status} onChange={(value) => onFilterChange('status', value)} options={maintenanceStatuses} labels={labelForStatus} />
        <label className="block min-w-0"><span className="sr-only">Date From</span><input type="date" value={filters.date_from} onChange={(event) => onFilterChange('date_from', event.target.value)} aria-label="Maintenance date from" className="w-full min-w-0 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" /></label>
        <label className="block min-w-0"><span className="sr-only">Date To</span><input type="date" value={filters.date_to} min={filters.date_from || undefined} onChange={(event) => onFilterChange('date_to', event.target.value)} aria-label="Maintenance date to" className="w-full min-w-0 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" /></label>
      </div>
    </div>
  )
}
