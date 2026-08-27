import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, CreditCard, RefreshCw, X } from 'lucide-react'
import { formatMembershipDate, formatMembershipPrice, humanizeMembershipStatus } from './membershipUtils'

export default function MembershipDetails({ open, loading, error, membership, onClose, onRetry }) {
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
      const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) return
      const first = focusable[0]; const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', handleKeyDown); previousFocus?.focus?.() }
  }, [onClose, open])

  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-3 backdrop-blur-sm sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="member-membership-details-title" initial={{ opacity: 0, y: 18, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.985 }} className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl"><header className="flex shrink-0 items-start justify-between border-b border-ink/10 px-5 py-5 sm:px-7"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink/40">Membership record</p><h2 id="member-membership-details-title" className="mt-2 font-heading text-3xl uppercase tracking-wide text-ink">Details</h2></div><button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close Membership details" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/55 transition hover:border-accent hover:text-ink"><X size={18} /></button></header><div className="min-h-0 overflow-y-auto px-5 py-6 sm:px-7">{loading ? <div className="flex min-h-56 items-center justify-center text-sm text-ink/45"><CreditCard className="mr-3 animate-pulse" size={19} />Loading Membership details...</div> : error ? <div className="flex min-h-56 items-center justify-center"><div className="max-w-sm text-center"><p className="text-sm leading-6 text-ink/60">{error}</p><button type="button" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-accent"><RefreshCw size={15} /> Retry</button></div></div> : membership && <><div className="flex flex-col gap-4 rounded-2xl bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-sm font-semibold">{membership.membership_number || 'Membership record'}</p><p className="mt-2 font-heading text-3xl uppercase tracking-wide">{membership.membership_plan?.name || 'Plan unavailable'}</p></div><span className="w-fit rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink">{humanizeMembershipStatus(membership.status)}</span></div><dl className="mt-5 grid gap-4 rounded-2xl border border-ink/10 bg-ink/[0.02] p-5 sm:grid-cols-2"><div><dt className="text-xs text-ink/40">Plan duration</dt><dd className="mt-1 text-sm font-semibold text-ink">{membership.membership_plan?.duration_days ?? '—'} days</dd></div><div><dt className="text-xs text-ink/40">Price</dt><dd className="mt-1 text-sm font-semibold text-ink">{formatMembershipPrice(membership.price)}</dd></div><div><dt className="text-xs text-ink/40">Start date</dt><dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink"><CalendarDays size={15} className="text-ink/40" />{formatMembershipDate(membership.starts_at)}</dd></div><div><dt className="text-xs text-ink/40">End date</dt><dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink"><CalendarDays size={15} className="text-ink/40" />{formatMembershipDate(membership.ends_at)}</dd></div><div><dt className="text-xs text-ink/40">Days remaining</dt><dd className="mt-1 text-sm font-semibold text-ink">{membership.days_remaining ?? 0}</dd></div><div><dt className="text-xs text-ink/40">Auto renew</dt><dd className="mt-1 text-sm font-semibold text-ink">{membership.auto_renew ? 'Enabled' : 'Disabled'}</dd></div></dl></>}</div><footer className="shrink-0 border-t border-ink/10 bg-white px-5 py-4 text-right sm:px-7"><button type="button" onClick={onClose} className="w-full rounded-xl bg-ink px-5 py-3 text-sm font-bold text-accent transition hover:-translate-y-0.5 sm:w-auto">Close</button></footer></motion.div></motion.div>}</AnimatePresence>
}
