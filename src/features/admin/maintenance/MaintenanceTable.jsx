import { Edit3, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCost, formatDate, labelForStatus, labelForType } from './maintenanceUtils'

const statusStyles = {
  scheduled: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  in_progress: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  cancelled: 'border-slate-500/20 bg-slate-500/10 text-slate-700',
}

export default function MaintenanceTable({ records, onView, onEdit }) {
  return <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_18px_60px_rgba(18,18,18,0.06)]"><div className="overflow-x-auto"><table className="w-full min-w-[1000px] border-separate border-spacing-0"><thead className="bg-[#fbfbf9]"><tr>{['Equipment', 'Maintenance Date', 'Type', 'Cost', 'Status', 'Actions'].map((column) => <th key={column} className="px-5 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">{column}</th>)}</tr></thead><tbody>{records.map((record, index) => <motion.tr key={record.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }} className="border-t border-ink/5 text-sm text-ink/80 hover:bg-ink/[0.02]"><td className="px-5 py-5"><p className="font-semibold text-ink">{record.equipment?.name ?? 'Equipment unavailable'}</p><p className="mt-1 text-xs text-ink/45">{record.equipment?.asset_code ?? '—'}</p></td><td className="whitespace-nowrap px-5 py-5 text-ink/60">{formatDate(record.maintenance_date)}</td><td className="px-5 py-5">{labelForType(record.maintenance_type)}</td><td className="whitespace-nowrap px-5 py-5 font-semibold text-ink">{formatCost(record.cost)}</td><td className="px-5 py-5"><span className={'inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ' + (statusStyles[record.status] || 'border-ink/10 bg-ink/5 text-ink/60')}>{labelForStatus(record.status)}</span></td><td className="px-5 py-5"><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => onView(record)} aria-label={'View maintenance record for ' + (record.equipment?.name ?? 'Equipment')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink"><Eye size={16} /></button><button type="button" onClick={() => onEdit(record)} aria-label={'Edit maintenance record for ' + (record.equipment?.name ?? 'Equipment')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink"><Edit3 size={16} /></button></div></td></motion.tr>)}</tbody></table></div></div>
}
