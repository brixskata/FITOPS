import { Eye, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatAttendanceDateTime, formatDuration } from './attendanceUtils'

const stateStyles = {
  open: 'border-accent/50 bg-accent/15 text-ink',
  completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
}

export default function AttendanceTable({ attendance, onView, onCheckOut, checkingOutId }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_18px_60px_rgba(18,18,18,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-separate border-spacing-0">
          <thead className="bg-[#fbfbf9]"><tr>{['Member', 'Check In', 'Check Out', 'Duration', 'Status', 'Recorded By', 'Actions'].map((column) => <th key={column} className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">{column}</th>)}</tr></thead>
          <tbody>
            {attendance.map((record, index) => (
              <motion.tr key={record.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }} className="text-sm text-ink/75 hover:bg-ink/[0.02]">
                <td className="border-t border-ink/5 px-5 py-4"><p className="font-semibold text-ink">{record.member?.name ?? 'Member unavailable'}</p><p className="mt-1 text-xs text-ink/45">{record.member?.email ?? '—'}</p></td>
                <td className="border-t border-ink/5 px-5 py-4 whitespace-nowrap font-medium text-ink">{formatAttendanceDateTime(record.checked_in_at)}</td>
                <td className="border-t border-ink/5 px-5 py-4 whitespace-nowrap">{record.session_state === 'open' ? <span className="font-medium text-ink/55">Currently checked in</span> : formatAttendanceDateTime(record.checked_out_at)}</td>
                <td className="border-t border-ink/5 px-5 py-4 whitespace-nowrap">{record.session_state === 'open' ? '—' : formatDuration(record.duration)}</td>
                <td className="border-t border-ink/5 px-5 py-4"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${stateStyles[record.session_state] ?? 'border-ink/10 bg-ink/5 text-ink/60'}`}>{record.session_state === 'open' ? 'Open' : 'Completed'}</span></td>
                <td className="border-t border-ink/5 px-5 py-4"><p className="font-medium text-ink">{record.recorded_by?.name ?? 'System'}</p></td>
                <td className="border-t border-ink/5 px-5 py-4"><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => onView(record)} aria-label={`View attendance for ${record.member?.name ?? 'Member'}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink"><Eye size={16} /></button>{record.session_state === 'open' && <button type="button" onClick={() => onCheckOut(record)} disabled={checkingOutId === record.id} aria-label={`Check out ${record.member?.name ?? 'Member'}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ink px-4 text-xs font-bold uppercase tracking-wider text-accent transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"><LogOut size={15} />{checkingOutId === record.id ? 'Checking out...' : 'Check Out'}</button>}</div></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
