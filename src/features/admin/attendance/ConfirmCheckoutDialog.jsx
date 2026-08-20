import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../../../components/common/Button'
import { formatAttendanceDateTime } from './attendanceUtils'

export default function ConfirmCheckoutDialog({ attendance, loading, onCancel, onConfirm }) {
  useEffect(() => {
    if (!attendance) return undefined
    const overflow = document.body.style.overflow
    const onKeyDown = (event) => { if (event.key === 'Escape' && !loading) onCancel() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', onKeyDown) }
  }, [attendance, loading, onCancel])
  if (!attendance) return null

  return <AnimatePresence>{<motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div role="alertdialog" aria-modal="true" aria-labelledby="checkout-dialog-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}><p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Confirm checkout</p><h2 id="checkout-dialog-title" className="mt-3 font-heading text-3xl uppercase tracking-wide text-ink">Check Out Member?</h2><p className="mt-4 text-sm leading-6 text-ink/60">Check out <span className="font-semibold text-ink">{attendance.member?.name ?? 'this Member'}</span>? Laravel will use the current server timestamp.</p><div className="mt-5 rounded-2xl border border-ink/10 bg-ink/[0.02] p-4"><p className="text-xs text-ink/45">Checked in</p><p className="mt-1 text-sm font-semibold text-ink">{formatAttendanceDateTime(attendance.checked_in_at)}</p></div><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" onClick={onCancel} disabled={loading} className="w-full bg-white text-ink hover:bg-accent sm:w-auto">Cancel</Button><Button type="button" onClick={onConfirm} disabled={loading} className="w-full sm:w-auto">{loading ? 'Checking Out...' : 'Check Out'}</Button></div></motion.div></motion.div>}</AnimatePresence>
}
