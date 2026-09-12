import { Wrench } from 'lucide-react'

export default function EmptyState({ filtered = false }) {
  return <div className="rounded-3xl border border-ink/10 bg-white px-6 py-16 text-center shadow-[0_18px_60px_rgba(18,18,18,0.05)]"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-ink"><Wrench size={22} /></div><p className="mt-5 font-heading text-3xl uppercase tracking-wide text-ink">{filtered ? 'No matching records' : 'No maintenance records found'}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">{filtered ? 'Try a different search or filter.' : 'No maintenance records yet. Add a maintenance record to start tracking equipment service history.'}</p></div>
}
