import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { updateMemberPassword, getMemberPasswordErrorMessage } from '../../../services/memberPasswordService'
import { emptyPasswordForm, getPasswordErrorMessage, validatePasswordForm } from './settingsUtils'

const fields = [
  { name: 'current_password', label: 'Current password', autocomplete: 'current-password' },
  { name: 'password', label: 'New password', autocomplete: 'new-password' },
  { name: 'password_confirmation', label: 'Confirm new password', autocomplete: 'new-password' },
]

export default function PasswordChangeForm({ onCancel }) {
  const [form, setForm] = useState(emptyPasswordForm)
  const [errors, setErrors] = useState({})
  const [visible, setVisible] = useState({})
  const [saving, setSaving] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: null, form: null }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const clientErrors = validatePasswordForm(form)

    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors)
      return
    }

    setSaving(true)
    setErrors({})

    try {
      await updateMemberPassword({
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      setForm(emptyPasswordForm)
      setVisible({})
      setErrors({})
      toast.success('Password updated successfully.')
    } catch (error) {
      if (error.status === 422 && Object.keys(error.errors ?? {}).length) {
        setErrors(error.errors)
        toast('Please fix the highlighted fields.', { icon: '!' })
      } else {
        setErrors({ form: getPasswordErrorMessage(error) })
        toast.error(getMemberPasswordErrorMessage(error, getPasswordErrorMessage(error)))
      }
    } finally {
      setSaving(false)
    }
  }

  return <form onSubmit={submit} noValidate className="mt-6 border-t border-ink/10 pt-6"><div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => { const isVisible = visible[field.name]; return <div key={field.name} className={field.name === 'current_password' ? 'sm:col-span-2' : ''}><label htmlFor={field.name} className="text-xs font-bold uppercase tracking-[0.14em] text-ink/55">{field.label}</label><div className="relative mt-2"><input id={field.name} name={field.name} type={isVisible ? 'text' : 'password'} value={form[field.name]} onChange={updateField} autoComplete={field.autocomplete} disabled={saving} aria-invalid={Boolean(errors[field.name])} aria-describedby={errors[field.name] ? `${field.name}-error` : undefined} className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 pr-12 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:bg-ink/[0.03]" /> <button type="button" onClick={() => setVisible((current) => ({ ...current, [field.name]: !isVisible }))} disabled={saving} aria-label={isVisible ? `Hide ${field.label.toLowerCase()}` : `Show ${field.label.toLowerCase()}`} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink/45 transition hover:bg-ink/5 hover:text-ink disabled:opacity-40">{isVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors[field.name] && <p id={`${field.name}-error`} className="mt-2 text-xs font-medium text-red-600">{Array.isArray(errors[field.name]) ? errors[field.name][0] : errors[field.name]}</p>}</div> })}</div>{errors.form && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errors.form}</p>}<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} disabled={saving} className="rounded-xl border border-ink/10 px-4 py-3 text-sm font-bold text-ink transition hover:border-accent hover:bg-accent disabled:opacity-50">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-60">{saving && <LoaderCircle size={16} className="animate-spin" />}{saving ? 'Saving...' : 'Update password'}</button></div></form>
}
