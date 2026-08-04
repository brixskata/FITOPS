import { X } from 'lucide-react'
import Button from '../../../components/common/Button'

export default function MemberModal({ open, member, action, onClose }) {
  if (!open) return null

  const titleMap = {
    view: 'View Member',
    edit: 'Edit Member',
    archive: 'Archive Member',
    create: 'Add Member',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#151515] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent/80">Members module</p>
            <h3 className="mt-2 font-heading text-3xl uppercase tracking-wide">{titleMap[action] ?? 'Member'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/60 transition hover:border-accent hover:text-accent"
            aria-label="Close member modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm leading-6 text-white/70">
            This is a UI placeholder for {titleMap[action]?.toLowerCase() ?? 'member actions'}. The selected member is{' '}
            <span className="font-semibold text-accent">{member?.name ?? 'not selected yet'}</span>.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Laravel-powered create, update, and archive flows will plug in here in a later milestone.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" onClick={onClose} className="w-full bg-white text-ink hover:bg-accent sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
