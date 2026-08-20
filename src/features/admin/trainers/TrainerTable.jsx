import { Edit3, Eye, PauseCircle, PlayCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const statusStyles = {
  active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  inactive: 'border-slate-500/20 bg-slate-500/10 text-slate-700',
}

const formatDate = (date) => date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export default function TrainerTable({ trainers, onView, onEdit, onToggleStatus, statusUpdatingId }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_18px_60px_rgba(18,18,18,0.06)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full border-separate border-spacing-0">
          <thead className="bg-[#fbfbf9]"><tr>
            {['Trainer', 'Email', 'Employee Code', 'Specialization', 'Members', 'Hire Date', 'Status', 'Actions'].map((column) => <th key={column} className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">{column}</th>)}
          </tr></thead>
          <tbody>
            {trainers.map((trainer, index) => {
              const updating = statusUpdatingId === trainer.id
              return (
                <motion.tr key={trainer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }} className="border-t border-ink/5 text-sm text-ink/80 hover:bg-ink/[0.02]">
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-accent">{trainer.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'T'}</div><span className="max-w-44 truncate font-semibold text-ink">{trainer.name || 'Unnamed Trainer'}</span></div></td>
                  <td className="px-4 py-4 break-all">{trainer.email || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap font-semibold text-ink">{trainer.employee_code || '—'}</td>
                  <td className="max-w-56 px-4 py-4 text-ink/65">{trainer.specialization || '—'}</td>
                  <td className="px-4 py-4 font-semibold text-ink">{trainer.assigned_members_count ?? 0}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-ink/60">{formatDate(trainer.hire_date)}</td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${statusStyles[trainer.status] || 'border-ink/10 bg-ink/5 text-ink/60'}`}>{trainer.status || 'Unknown'}</span></td>
                  <td className="px-4 py-4"><div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onView(trainer)} aria-label={`View ${trainer.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink"><Eye size={16} /></button>
                    <button type="button" onClick={() => onEdit(trainer)} aria-label={`Edit ${trainer.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink"><Edit3 size={16} /></button>
                    <button type="button" onClick={() => onToggleStatus(trainer)} disabled={updating} aria-label={`${trainer.status === 'active' ? 'Deactivate' : 'Activate'} ${trainer.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40">{trainer.status === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}</button>
                  </div></td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
