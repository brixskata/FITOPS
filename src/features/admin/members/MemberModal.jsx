import { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '../../../components/common/Button'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  status: 'active',
  gender: '',
  date_of_birth: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  height: '',
  weight: '',
}

const fields = [
  { name: 'name', label: 'Full Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'suspended'] },
  { name: 'gender', label: 'Gender', type: 'select', options: ['', 'male', 'female', 'other'] },
  { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
  { name: 'height', label: 'Height', type: 'number' },
  { name: 'weight', label: 'Weight', type: 'number' },
]

function Field({ field, value, error, onChange }) {
  if (field.type === 'select') {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink/70">{field.label}</span>
        <select
          name={field.name}
          value={value ?? ''}
          onChange={onChange}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
        >
          {field.options.map((option) => (
            <option key={option || 'empty'} value={option}>
              {option ? option.charAt(0).toUpperCase() + option.slice(1) : 'Select one'}
            </option>
          ))}
        </select>
        {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
      </label>
    )
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink/70">{field.label}</span>
      <input
        name={field.name}
        type={field.type}
        value={value ?? ''}
        onChange={onChange}
        className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
      />
      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
    </label>
  )
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/40">{label}</p>
      <p className="mt-2 text-sm font-medium text-ink">{value}</p>
    </div>
  )
}

export default function MemberModal({
  open,
  mode,
  member,
  form,
  errors,
  message,
  saving,
  deleting,
  onClose,
  onSubmit,
  onEdit,
  onDelete,
  onChange,
}) {
  useEffect(() => {
    if (!open) {
      return undefined
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const titleMap = {
    create: 'Add Member',
    edit: 'Edit Member',
    view: 'View Member',
    delete: 'Delete Member',
  }

  const isReadOnly = mode === 'view'
  const isDelete = mode === 'delete'
  const isEditing = mode === 'edit'
  const displayFields = form ?? emptyForm
  const formId = 'member-modal-form'

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit?.(event)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-auto flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white text-ink shadow-2xl">
        <div className="shrink-0 px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Members module</p>
              <h3 className="mt-2 font-heading text-3xl uppercase tracking-wide">{titleMap[mode] ?? 'Member'}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-ink/10 p-2 text-ink/60 transition hover:border-accent hover:text-ink"
              aria-label="Close member modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {message && (
          <div className="shrink-0 px-6 pt-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {message}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isDelete ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <p className="text-sm leading-6 text-rose-900">
                This will permanently remove <span className="font-semibold">{member?.name}</span> and the linked account record.
              </p>
              <p className="mt-2 text-sm leading-6 text-rose-700">
                Member code: <span className="font-semibold">{member?.member_code}</span>
              </p>
            </div>
          ) : isReadOnly ? (
            <div className="grid gap-4 rounded-2xl border border-ink/10 bg-ink/[0.02] p-5 sm:grid-cols-2">
              <Detail label="Member Code" value={member?.member_code} />
              <Detail label="Status" value={member?.status_label ?? member?.status} />
              <Detail label="Full Name" value={member?.name} />
              <Detail label="Email" value={member?.email} />
              <Detail label="Phone" value={member?.phone} />
              <Detail label="Membership" value={member?.membership?.plan_name ?? 'No Membership'} />
              <Detail label="Joined Date" value={member?.joined_date} />
              <Detail label="Gender" value={member?.gender ?? 'N/A'} />
              <Detail label="Date of Birth" value={member?.date_of_birth ?? 'N/A'} />
              <Detail label="Emergency Contact" value={member?.emergency_contact_name ?? 'N/A'} />
              <Detail label="Emergency Phone" value={member?.emergency_contact_phone ?? 'N/A'} />
              <div className="sm:col-span-2">
                <Detail label="Address" value={member?.address ?? 'N/A'} />
              </div>
            </div>
          ) : (
            <form id={formId} className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field field={fields[0]} value={displayFields.name} error={errors.name?.[0]} onChange={onChange} />
                <Field field={fields[1]} value={displayFields.email} error={errors.email?.[0]} onChange={onChange} />
                <Field field={fields[2]} value={displayFields.phone} error={errors.phone?.[0]} onChange={onChange} />
                <Field field={fields[3]} value={displayFields.status} error={errors.status?.[0]} onChange={onChange} />
                <Field field={fields[4]} value={displayFields.gender} error={errors.gender?.[0]} onChange={onChange} />
                <Field field={fields[5]} value={displayFields.date_of_birth} error={errors.date_of_birth?.[0]} onChange={onChange} />
                <Field field={fields[6]} value={displayFields.height} error={errors.height?.[0]} onChange={onChange} />
                <Field field={fields[7]} value={displayFields.weight} error={errors.weight?.[0]} onChange={onChange} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-ink/70">Emergency Contact Name</span>
                  <input
                    name="emergency_contact_name"
                    type="text"
                    value={displayFields.emergency_contact_name ?? ''}
                    onChange={onChange}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                  />
                  {errors.emergency_contact_name && <p className="mt-2 text-xs font-medium text-rose-600">{errors.emergency_contact_name[0]}</p>}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-ink/70">Emergency Contact Phone</span>
                  <input
                    name="emergency_contact_phone"
                    type="text"
                    value={displayFields.emergency_contact_phone ?? ''}
                    onChange={onChange}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                  />
                  {errors.emergency_contact_phone && <p className="mt-2 text-xs font-medium text-rose-600">{errors.emergency_contact_phone[0]}</p>}
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink/70">Address</span>
                <textarea
                  name="address"
                  rows="3"
                  value={displayFields.address ?? ''}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                />
                {errors.address && <p className="mt-2 text-xs font-medium text-rose-600">{errors.address[0]}</p>}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-ink/70">
                    Password {isEditing ? '(leave blank to keep current)' : ''}
                  </span>
                  <input
                    name="password"
                    type="password"
                    value={displayFields.password ?? ''}
                    onChange={onChange}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                  />
                  {errors.password && <p className="mt-2 text-xs font-medium text-rose-600">{errors.password[0]}</p>}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-ink/70">Confirm Password</span>
                  <input
                    name="password_confirmation"
                    type="password"
                    value={displayFields.password_confirmation ?? ''}
                    onChange={onChange}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                  />
                  {errors.password_confirmation && <p className="mt-2 text-xs font-medium text-rose-600">{errors.password_confirmation[0]}</p>}
                </label>
              </div>
            </form>
          )}
        </div>

        <div className="shrink-0 border-t border-ink/10 bg-white px-6 py-4">
          {isReadOnly && (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" onClick={onClose} className="w-full bg-white text-ink hover:bg-accent sm:w-auto">
                Close
              </Button>
              <Button type="button" onClick={onEdit} className="w-full sm:w-auto">
                Edit Member
              </Button>
            </div>
          )}

          {isDelete && (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" onClick={onClose} className="w-full bg-white text-ink hover:bg-accent sm:w-auto" disabled={saving || deleting}>
                Cancel
              </Button>
              <Button type="button" onClick={onDelete} disabled={saving || deleting} className="w-full bg-rose-600 text-white hover:bg-rose-500 sm:w-auto">
                {deleting ? 'Deleting...' : 'Delete Member'}
              </Button>
            </div>
          )}

          {!isReadOnly && !isDelete && (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" onClick={onClose} className="w-full bg-white text-ink hover:bg-accent sm:w-auto" disabled={saving || deleting}>
                Cancel
              </Button>
              <Button type="submit" form={formId} disabled={saving || deleting} className="w-full sm:w-auto">
                {saving ? (isEditing ? 'Updating...' : 'Saving...') : 'Save Member'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
