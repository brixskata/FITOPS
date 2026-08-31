import { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '../../../components/common/Button'
import { labelize, maintenanceStatusLabel } from './equipmentUtils'

function Detail({ label, value }) {
  return <div className="rounded-2xl border border-ink/10 bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/40">{label}</p><p className="mt-2 break-words text-sm font-medium text-ink">{value || 'N/A'}</p></div>
}

const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'

export default function EquipmentDetailsModal({ open, loading, equipment, error, onClose, onEdit }) {
  useEffect(() => {
    if (!open) return undefined
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => { document.body.style.overflow = originalOverflow; window.removeEventListener('keydown', handleKeyDown) }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white text-ink shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Equipment module</p><h3 className="mt-2 font-heading text-3xl uppercase tracking-wide">Equipment details</h3></div><button type="button" onClick={onClose} className="rounded-full border border-ink/10 p-2 text-ink/60 transition hover:border-accent hover:text-ink" aria-label="Close equipment details"><X size={18} /></button></div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading && <div className="space-y-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-ink/5" />)}</div>}
          {!loading && error && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}
          {!loading && !error && equipment && <div className="grid gap-4 sm:grid-cols-2"><Detail label="Equipment Name" value={equipment.name} /><Detail label="Asset Code" value={equipment.asset_code} /><Detail label="Category" value={equipment.category_label || labelize(equipment.category)} /><Detail label="Brand" value={equipment.brand} /><Detail label="Model" value={equipment.model} /><Detail label="Condition" value={equipment.condition_label || labelize(equipment.condition)} /><Detail label="Status" value={equipment.status_label || labelize(equipment.status)} /><Detail label="Maintenance Status" value={maintenanceStatusLabel(equipment.maintenance_status)} /><Detail label="Last Maintenance" value={formatDate(equipment.last_maintenance_at)} /><Detail label="Next Maintenance" value={formatDate(equipment.next_maintenance_at)} /><div className="sm:col-span-2"><Detail label="Maintenance Notes" value={equipment.maintenance_notes} /></div><div className="sm:col-span-2"><Detail label="Notes" value={equipment.notes} /></div></div>}
        </div>
        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-ink/10 bg-white px-6 py-4 sm:flex-row sm:justify-end"><Button type="button" onClick={onClose} className="w-full bg-white text-ink hover:bg-accent sm:w-auto">Close</Button>{equipment && !error && <Button type="button" onClick={() => onEdit(equipment)} className="w-full sm:w-auto">Edit Equipment</Button>}</div>
      </div>
    </div>
  )
}
