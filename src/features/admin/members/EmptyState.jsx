import { UserX } from 'lucide-react'
import Button from '../../../components/common/Button'

export default function EmptyState({ onReset }) {
  return (
    <div className="rounded-3xl border border-dashed border-ink/15 bg-white p-10 text-center shadow-[0_18px_60px_rgba(18,18,18,0.05)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-ink">
        <UserX size={24} />
      </div>
      <h3 className="mt-6 font-heading text-3xl uppercase tracking-wide text-ink">No members found</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">
        Try widening the search or clearing the filters to bring the member list back into view.
      </p>
      <div className="mt-6">
        <Button type="button" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    </div>
  )
}
