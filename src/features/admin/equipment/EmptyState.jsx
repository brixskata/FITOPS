import { Dumbbell } from 'lucide-react'
import Button from '../../../components/common/Button'

export default function EmptyState({ filtered, onReset, onAddEquipment }) {
  return <div className="rounded-3xl border border-dashed border-ink/15 bg-white p-10 text-center shadow-[0_18px_60px_rgba(18,18,18,0.05)]"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-ink"><Dumbbell size={24} /></div><h3 className="mt-6 font-heading text-3xl uppercase tracking-wide text-ink">{filtered ? 'No equipment found' : 'No equipment yet'}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">{filtered ? 'Try widening your search or clearing the filters.' : 'Add your first equipment record to start tracking the gym floor.'}</p><div className="mt-6"><Button type="button" onClick={filtered ? onReset : onAddEquipment}>{filtered ? 'Reset filters' : 'Add equipment'}</Button></div></div>
}
