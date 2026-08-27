import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Clock3, RefreshCw, X } from 'lucide-react'
import { formatAttendanceDate, formatAttendanceDateTime, formatAttendanceDuration } from './attendanceUtils'

export default function AttendanceDetailsModal({ open, loading, error, attendance, onClose, onRetry }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus?.()
    }
  }, [onClose, open])

  return (
    <AnimatePresence>
      {open && <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-3 backdrop-blur-sm sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="member-attendance-details-title" initial={{ opacity: 0, y: 18, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.985 }} className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
          <header className="flex shrink-0 items-start justify-between border-b border-ink/10 px-5 py-5 sm:px-7">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink/40">Visit record</p><h2 id="member-attendance-details-title" className="mt-2 font-heading text-3xl uppercase tracking-wide text-ink">Attendance details</h2></div>
            <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close attendance details" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/55 transition hover:border-accent hover:text-ink"><X size={18} /></button>
          </header>

          <div className="min-h-0 overflow-y-auto px-5 py-6 sm:px-7">
            {loading ? <div className="flex min-h-56 items-center justify-center"><span className="flex items-center gap-3 text-sm text-ink/45"><Clock3 className="animate-pulse" size={19} /> Loading attendance details...</span></div> : error ? <div className="flex min-h-56 items-center justify-center"><div className="max-w-sm text-center"><p className="text-sm leading-6 text-ink/60">{error}</p><button type="button" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-accent"><RefreshCw size={15} /> Retry</button></div></div> : attendance && <>
              <div className="flex flex-col gap-4 rounded-2xl bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-ink"><CalendarDays size={19} /></span><div><p className="text-xs text-white/45">Visit date</p><p className="mt-1 font-semibold">{formatAttendanceDate(attendance.checked_in_at)}</p></div></div>
                <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${attendance.session_state === 'open' ? 'bg-accent text-ink' : 'bg-white/10 text-white'}`}>{attendance.session_state === 'open' ? 'Currently open' : 'Completed'}</span>
              </div>
              <dl className="mt-5 grid gap-4 rounded-2xl border border-ink/10 bg-ink/[0.02] p-5 sm:grid-cols-2">
                <div><dt className="text-xs text-ink/40">Check-in</dt><dd className="mt-1 text-sm font-semibold text-ink">{formatAttendanceDateTime(attendance.checked_in_at)}</dd></div>
                <div><dt className="text-xs text-ink/40">Check-out</dt><dd className="mt-1 text-sm font-semibold text-ink">{attendance.session_state === 'open' ? 'In progress' : formatAttendanceDateTime(attendance.checked_out_at)}</dd></div>
                <div><dt className="text-xs text-ink/40">Duration</dt><dd className="mt-1 text-sm font-semibold text-ink">{attendance.session_state === 'open' ? 'In progress' : formatAttendanceDuration(attendance.duration)}</dd></div>
                <div><dt className="text-xs text-ink/40">Session status</dt><dd className="mt-1 text-sm font-semibold capitalize text-ink">{attendance.session_state}</dd></div>
              </dl>
              <div className="mt-5 border-t border-ink/10 pt-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/40">Notes</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink/60">{attendance.notes || 'No notes recorded for this visit.'}</p></div>
            </>}
          </div>

          <footer className="shrink-0 border-t border-ink/10 bg-white px-5 py-4 text-right sm:px-7">
            <button type="button" onClick={onClose} className="w-full rounded-xl bg-ink px-5 py-3 text-sm font-bold text-accent transition hover:-translate-y-0.5 sm:w-auto">Close</button>
          </footer>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  )
}
