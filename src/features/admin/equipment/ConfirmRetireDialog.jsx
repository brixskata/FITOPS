import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AdminModal from '../../../components/common/AdminModal'
import Button from '../../../components/common/Button'

export default function ConfirmRetireDialog({ equipment, loading, onCancel, onConfirm }) {
  useEffect(() => {
    if (!equipment) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [equipment, loading, onCancel])

  return (
    <AnimatePresence>
      {equipment && (
        <AdminModal zIndex="z-[60]">
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="retire-equipment-title"
            aria-describedby="retire-equipment-description"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Confirm retirement</p>
            <h2 id="retire-equipment-title" className="mt-3 font-heading text-3xl uppercase tracking-wide text-ink">
              Retire Equipment?
            </h2>
            <p id="retire-equipment-description" className="mt-4 text-sm leading-6 text-ink/60">
              Retire <span className="font-semibold text-ink">{equipment.name}</span>? The record will remain in FitOps but its status will be marked as retired.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" onClick={onCancel} disabled={loading} className="w-full bg-white text-ink hover:bg-accent sm:w-auto">
                Cancel
              </Button>
              <Button type="button" onClick={onConfirm} disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Retiring...' : 'Retire Equipment'}
              </Button>
            </div>
          </motion.div>
        </AdminModal>
      )}
    </AnimatePresence>
  )
}
