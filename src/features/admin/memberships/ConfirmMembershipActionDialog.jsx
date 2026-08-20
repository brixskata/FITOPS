import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../../../components/common/Button'

export default function ConfirmMembershipActionDialog({ action, loading, onCancel, onConfirm }) {
  useEffect(() => { if (!action) return undefined; const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = overflow } }, [action])
  if (!action) return null
  const renewal = action.type === 'renew'
  const title = renewal ? 'Renew Membership?' : `${action.nextStatus === 'cancelled' ? 'Cancel' : action.nextStatus === 'active' ? 'Activate' : 'Mark Expired'} Membership?`
  const message = renewal ? `Renew ${action.membership.member?.name ?? 'this member'}'s membership? This creates a new membership record and preserves all previous membership and payment history.` : `Change ${action.membership.membership_number} to ${action.nextStatus}? This does not modify payments, the membership plan, or its historical price.`
  return <AnimatePresence>{<motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}><p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Confirm action</p><h2 className="mt-3 font-heading text-3xl uppercase tracking-wide text-ink">{title}</h2><p className="mt-4 text-sm leading-6 text-ink/60">{message}</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" onClick={onCancel} disabled={loading} className="w-full bg-white text-ink hover:bg-accent sm:w-auto">Cancel</Button><Button type="button" onClick={onConfirm} disabled={loading} className="w-full sm:w-auto">{loading ? (renewal ? 'Renewing...' : 'Updating...') : renewal ? 'Renew Membership' : 'Confirm'}</Button></div></motion.div></motion.div>}</AnimatePresence>
}
