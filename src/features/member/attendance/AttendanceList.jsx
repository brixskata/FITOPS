import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, Clock3 } from 'lucide-react'
import { formatAttendanceDate, formatAttendanceDuration, formatAttendanceTime } from './attendanceUtils'

function StatusBadge({ state }) {
  const open = state === 'open'
  return <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${open ? 'border-accent/50 bg-accent/15 text-ink' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'}`}>{open ? 'In progress' : 'Completed'}</span>
}

function ViewButton({ onClick }) {
  return <button type="button" onClick={onClick} aria-label="View attendance details" className="inline-flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-2 text-xs font-bold text-ink transition hover:border-accent hover:bg-accent/10">View <ArrowUpRight size={14} /></button>
}

export default function AttendanceList({ attendance, onView }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_16px_50px_rgba(18,18,18,0.04)]">
      <div className="flex items-center gap-3 border-b border-ink/10 p-5 sm:p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-ink"><CalendarDays size={19} /></span>
        <div>
          <h2 className="font-heading text-2xl uppercase tracking-wide text-ink sm:text-3xl">Visit history</h2>
          <p className="mt-1 text-xs text-ink/45">Your recorded FitOps gym sessions.</p>
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[780px] text-left">
          <thead className="bg-ink/[0.03] text-[11px] uppercase tracking-[0.16em] text-ink/40">
            <tr><th className="px-6 py-4 font-semibold">Date</th><th className="px-6 py-4 font-semibold">Check in</th><th className="px-6 py-4 font-semibold">Check out</th><th className="px-6 py-4 font-semibold">Duration</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 text-right font-semibold">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {attendance.map((visit, index) => <motion.tr key={visit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.035, 0.2) }} className="text-sm transition hover:bg-ink/[0.02]"><td className="px-6 py-4 font-semibold text-ink">{formatAttendanceDate(visit.checked_in_at)}</td><td className="px-6 py-4 text-ink/60">{formatAttendanceTime(visit.checked_in_at)}</td><td className="px-6 py-4 text-ink/60">{visit.session_state === 'open' ? 'In progress' : formatAttendanceTime(visit.checked_out_at)}</td><td className="px-6 py-4 font-semibold text-ink">{visit.session_state === 'open' ? 'In progress' : formatAttendanceDuration(visit.duration)}</td><td className="px-6 py-4"><StatusBadge state={visit.session_state} /></td><td className="px-6 py-4 text-right"><ViewButton onClick={() => onView(visit.id)} /></td></motion.tr>)}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-ink/10 md:hidden">
        {attendance.map((visit, index) => <motion.article key={visit.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.2) }} className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-bold text-ink">{formatAttendanceDate(visit.checked_in_at)}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-ink/45"><Clock3 size={13} /> {formatAttendanceTime(visit.checked_in_at)} check-in</p></div><StatusBadge state={visit.session_state} /></div><dl className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-ink/[0.025] p-4"><div><dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">Check out</dt><dd className="mt-1 text-sm font-semibold text-ink">{visit.session_state === 'open' ? 'In progress' : formatAttendanceTime(visit.checked_out_at)}</dd></div><div><dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">Duration</dt><dd className="mt-1 text-sm font-semibold text-ink">{visit.session_state === 'open' ? 'In progress' : formatAttendanceDuration(visit.duration)}</dd></div></dl><div className="mt-4"><ViewButton onClick={() => onView(visit.id)} /></div></motion.article>)}
      </div>
    </div>
  )
}
