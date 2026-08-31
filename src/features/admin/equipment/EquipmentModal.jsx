import { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '../../../components/common/Button'
import { categories, conditions, labelize, statuses } from './equipmentUtils'

const fields = [
  { name: 'name', label: 'Equipment Name', type: 'text', required: true },
  { name: 'asset_code', label: 'Asset Code', type: 'text' },
  { name: 'brand', label: 'Brand', type: 'text' },
  { name: 'model', label: 'Model', type: 'text' },
  { name: 'last_maintenance_at', label: 'Last Maintenance', type: 'date' },
  { name: 'next_maintenance_at', label: 'Next Maintenance', type: 'date' },
]

function Field({ field, value, error, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink/70">{field.label}{field.required && <span className="text-rose-600"> *</span>}</span>
      <input name={field.name} type={field.type} value={value ?? ''} onChange={onChange} className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />
      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error[0]}</p>}
    </label>
  )
}

function SelectField({ name, label, value, options, error, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink/70">{label} <span className="text-rose-600">*</span></span>
      <select name={name} value={value ?? ''} onChange={onChange} className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent">
        {options.map((option) => <option key={option} value={option}>{labelize(option)}</option>)}
      </select>
      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error[0]}</p>}
    </label>
  )
}

export default function EquipmentModal({ open, mode, form, errors, message, saving, onClose, onSubmit, onChange }) {
  useEffect(() => {
    if (!open) return undefined
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null
  const editing = mode === 'edit'
  const formId = 'equipment-modal-form'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white text-ink shadow-2xl">
        <div className="shrink-0 px-6 pt-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Equipment module</p><h3 className="mt-2 font-heading text-3xl uppercase tracking-wide">{editing ? 'Edit Equipment' : 'Add Equipment'}</h3></div><button type="button" onClick={onClose} className="rounded-full border border-ink/10 p-2 text-ink/60 transition hover:border-accent hover:text-ink" aria-label="Close equipment modal"><X size={18} /></button></div></div>
        {message && <div className="shrink-0 px-6 pt-4"><div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div></div>}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id={formId} className="space-y-5" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.slice(0, 4).map((field) => <Field key={field.name} field={field} value={form[field.name]} error={errors[field.name]} onChange={onChange} />)}
              <SelectField name="category" label="Category" value={form.category} options={categories} error={errors.category} onChange={onChange} />
              <SelectField name="condition" label="Condition" value={form.condition} options={conditions} error={errors.condition} onChange={onChange} />
              <SelectField name="status" label="Status" value={form.status} options={statuses} error={errors.status} onChange={onChange} />
              {fields.slice(4).map((field) => <Field key={field.name} field={field} value={form[field.name]} error={errors[field.name]} onChange={onChange} />)}
            </div>
            <label className="block"><span className="mb-2 block text-sm font-medium text-ink/70">Maintenance Notes</span><textarea name="maintenance_notes" rows="3" value={form.maintenance_notes ?? ''} onChange={onChange} className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />{errors.maintenance_notes && <p className="mt-2 text-xs font-medium text-rose-600">{errors.maintenance_notes[0]}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-ink/70">Notes</span><textarea name="notes" rows="3" value={form.notes ?? ''} onChange={onChange} className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent" />{errors.notes && <p className="mt-2 text-xs font-medium text-rose-600">{errors.notes[0]}</p>}</label>
          </form>
        </div>
        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-ink/10 bg-white px-6 py-4 sm:flex-row sm:justify-end"><Button type="button" onClick={onClose} className="w-full bg-white text-ink hover:bg-accent sm:w-auto" disabled={saving}>Cancel</Button><Button type="submit" form={formId} disabled={saving} className="w-full sm:w-auto">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Equipment'}</Button></div>
      </div>
    </div>
  )
}
