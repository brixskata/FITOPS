import AdminModal from '../../../components/common/AdminModal'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../../../components/common/Button'

const label = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : value

export default function ConfirmPaymentStatusDialog({ action, loading, onCancel, onConfirm }) {
  useEffect(() => { if (!action) return undefined; const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = overflow } }, [action])
  if (!action) return null
  return <AnimatePresence>{<AdminModal zIndex="z-[60]"><motion.div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}><p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Confirm status update</p><h2 className="mt-3 font-heading text-3xl uppercase tracking-wide text-ink">Update Payment?</h2><p className="mt-4 text-sm leading-6 text-ink/60">Change {action.payment.receipt_number} from {label(action.payment.status)} to {label(action.nextStatus)}? Laravel will recheck the Membership balance and any valid transition rules.</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" onClick={onCancel} disabled={loading} className="w-full bg-white text-ink hover:bg-accent sm:w-auto">Cancel</Button><Button type="button" onClick={onConfirm} disabled={loading} className="w-full sm:w-auto">{loading ? 'Updating...' : 'Confirm Update'}</Button></div></motion.div></AdminModal>}</AnimatePresence>
}
