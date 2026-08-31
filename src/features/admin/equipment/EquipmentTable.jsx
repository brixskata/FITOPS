import { Archive, Edit3, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { labelize, maintenanceStatusLabel } from './equipmentUtils'

const statusStyles = {
  operational: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  under_maintenance: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  out_of_service: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  retired: 'border-slate-500/20 bg-slate-500/10 text-slate-700',
}

const conditionStyles = {
  excellent: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  good: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  fair: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  poor: 'border-orange-500/20 bg-orange-500/10 text-orange-700',
  damaged: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
}

const maintenanceStyles = {
  none: 'border-ink/10 bg-ink/5 text-ink/60',
  scheduled: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  due_soon: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  overdue: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  under_maintenance: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
}

const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const badgeClass = (styles, value) => 'inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ' + (styles[value] || 'border-ink/10 bg-ink/5 text-ink/60')

export default function EquipmentTable({ equipment, onView, onEdit, onRetire, retiringId }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_18px_60px_rgba(18,18,18,0.06)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full border-separate border-spacing-0">
          <thead className="bg-[#fbfbf9]"><tr>{['Equipment', 'Category', 'Condition', 'Status', 'Maintenance', 'Last Service', 'Next Service', 'Actions'].map((column) => <th key={column} className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">{column}</th>)}</tr></thead>
          <tbody>
            {equipment.map((item, index) => (
              <motion.tr key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }} className="border-t border-ink/5 text-sm text-ink/80 hover:bg-ink/[0.02]">
                <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-accent">{item.name?.charAt(0).toUpperCase() || 'E'}</div><div className="min-w-0"><p className="max-w-52 truncate font-semibold text-ink">{item.name || 'Unnamed Equipment'}</p><p className="mt-1 text-xs text-ink/45">{item.asset_code || 'No asset code'}</p></div></div></td>
                <td className="px-4 py-4 whitespace-nowrap">{item.category_label || labelize(item.category)}</td>
                <td className="px-4 py-4"><span className={badgeClass(conditionStyles, item.condition)}>{item.condition_label || labelize(item.condition)}</span></td>
                <td className="px-4 py-4"><span className={badgeClass(statusStyles, item.status)}>{item.status_label || labelize(item.status)}</span></td>
                <td className="px-4 py-4"><span className={badgeClass(maintenanceStyles, item.maintenance_status)}>{maintenanceStatusLabel(item.maintenance_status)}</span></td>
                <td className="px-4 py-4 whitespace-nowrap text-ink/60">{formatDate(item.last_maintenance_at)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-ink/60">{formatDate(item.next_maintenance_at)}</td>
                <td className="px-4 py-4"><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => onView(item)} aria-label={'View ' + item.name} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink"><Eye size={16} /></button><button type="button" onClick={() => onEdit(item)} aria-label={'Edit ' + item.name} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink"><Edit3 size={16} /></button>{item.status !== 'retired' && <button type="button" onClick={() => onRetire(item)} disabled={retiringId === item.id} aria-label={'Retire ' + item.name} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"><Archive size={16} /></button>}</div></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
