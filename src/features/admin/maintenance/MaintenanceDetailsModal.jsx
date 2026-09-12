import AdminModal from '../../../components/common/AdminModal'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, CircleDollarSign, Wrench, X } from 'lucide-react'
import Button from '../../../components/common/Button'
import { formatCost, formatDate, formatDateTime, labelForStatus, labelForType } from './maintenanceUtils'

function Detail({ label, value, icon: Icon }) {
  return <div className="rounded-2xl border border-ink/10 bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/40">{label}</p><p className="mt-2 flex items-start gap-2 break-words text-sm font-medium text-ink">{Icon && <Icon size={15} className="mt-0.5 shrink-0 text-ink/35" />}{value || 'N/A'}</p></div>
}

export default function MaintenanceDetailsModal({ open, loading, record, error, onClose, onEdit }) {
  useEffect(() => {
    if (!open) return undefined
    const originalOverflow = document.body.style.overflow
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => { document.body.style.overflow = originalOverflow; window.removeEventListener('keydown', handleKeyDown) }
  }, [open, onClose])

  return <AnimatePresence>{open && <AdminModal padding="p-2 sm:p-4"><motion.div role="dialog" aria-modal="true" aria-labelledby="maintenance-details-title" initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.25 }} className="flex w-full max-w-3xl min-w-0 flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white text-ink shadow-2xl"><div className="flex shrink-0 items-start justify-between border-b border-ink/10 px-6 py-5 sm:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Maintenance record</p><h2 id="maintenance-details-title" className="mt-2 font-heading text-3xl uppercase tracking-wide">Details</h2></div><button type="button" onClick={onClose} aria-label="Close maintenance details" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink"><X size={18} /></button></div><div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">{loading && <div className="space-y-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-ink/5" />)}</div>}{!loading && error && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}{!loading && !error && record && <><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-accent"><Wrench size={25} /></div><div><h3 className="text-xl font-bold text-ink">{record.equipment?.name ?? 'Equipment unavailable'}</h3><p className="mt-1 text-sm text-ink/55">{record.equipment?.asset_code ?? '—'}</p></div><span className="inline-flex w-fit rounded-full border border-ink/10 bg-ink/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-ink/65 sm:ml-auto">{labelForStatus(record.status)}</span></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><Detail label="Equipment" value={record.equipment?.name} /><Detail label="Asset Code" value={record.equipment?.asset_code} /><Detail label="Maintenance Date" value={formatDate(record.maintenance_date)} icon={CalendarDays} /><Detail label="Maintenance Type" value={labelForType(record.maintenance_type)} /><Detail label="Cost" value={formatCost(record.cost)} icon={CircleDollarSign} /><Detail label="Status" value={labelForStatus(record.status)} /><div className="sm:col-span-2"><Detail label="Description" value={record.description} /></div><div className="sm:col-span-2"><Detail label="Notes" value={record.notes} /></div><Detail label="Created At" value={formatDateTime(record.created_at)} /><Detail label="Updated At" value={formatDateTime(record.updated_at)} /></div></>}</div><div className="flex shrink-0 flex-col-reverse gap-3 border-t border-ink/10 bg-white px-6 py-4 sm:flex-row sm:justify-end sm:px-8"><Button type="button" onClick={onClose} className="w-full bg-white text-ink hover:bg-accent sm:w-auto">Close</Button>{record && !error && <Button type="button" onClick={() => onEdit(record)} className="w-full sm:w-auto">Edit Maintenance</Button>}</div></motion.div></AdminModal>}</AnimatePresence>
}
