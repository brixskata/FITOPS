import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../../../components/common/Button'

export default function ConfirmStatusDialog({ trainer, nextStatus, loading, onCancel, onConfirm }) {
  useEffect(() => {
    if (!trainer) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [trainer])

  return <AnimatePresence>{trainer && <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}><p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Confirm status change</p><h2 className="mt-3 font-heading text-3xl uppercase tracking-wide text-ink">{nextStatus === 'inactive' ? 'Deactivate Trainer?' : 'Activate Trainer?'}</h2><p className="mt-4 text-sm leading-6 text-ink/60">{nextStatus === 'inactive' ? `Deactivate ${trainer.name}? Existing member assignments will remain intact, but this Trainer will no longer be available for new assignments.` : `Activate ${trainer.name}? This Trainer will become available for new member assignments.`}</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" onClick={onCancel} disabled={loading} className="w-full bg-white text-ink hover:bg-accent sm:w-auto">Cancel</Button><Button type="button" onClick={onConfirm} disabled={loading} className="w-full sm:w-auto">{loading ? 'Updating...' : nextStatus === 'inactive' ? 'Deactivate' : 'Activate'}</Button></div></motion.div></motion.div>}</AnimatePresence>
}
