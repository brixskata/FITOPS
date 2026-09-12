import { Eye, EyeOff, KeyRound, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { changeAdminPassword, getAdminSettingsErrorMessage } from '../../../services/adminSettingsService'

const emptyForm = { current_password: '', password: '', password_confirmation: '' }
const fields = [
  ['current_password', 'Current password', 'current-password'],
  ['password', 'New password', 'new-password'],
  ['password_confirmation', 'Confirm new password', 'new-password'],
]
const inputClass = 'mt-2 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 pr-12 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:bg-ink/[0.03]'
const firstError = (value) => Array.isArray(value) ? value[0] : value

export default function SecuritySection() {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [visible, setVisible] = useState({})
  const [saving, setSaving] = useState(false)

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: null, form: null }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const clientErrors = {}

    if (!form.current_password) clientErrors.current_password = ['Current password is required.']
    if (!form.password) clientErrors.password = ['New password is required.']
    else if (form.password.length < 8) clientErrors.password = ['The password must be at least 8 characters.']
    if (!form.password_confirmation) clientErrors.password_confirmation = ['Please confirm your new password.']
    else if (form.password !== form.password_confirmation) clientErrors.password_confirmation = ['The password confirmation does not match.']

    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors)
      return
    }

    setSaving(true)
    setErrors({})

    try {
      await changeAdminPassword(form)
      setForm(emptyForm)
      setVisible({})
      toast.success('Password updated successfully.')
    } catch (error) {
      if (error.status === 422 && Object.keys(error.errors ?? {}).length) {
        setErrors(error.errors)
        toast('Please fix the highlighted fields.', { icon: '!' })
      } else {
        setErrors({ form: getAdminSettingsErrorMessage(error, 'Unable to update your password.') })
        toast.error(getAdminSettingsErrorMessage(error, 'Unable to update your password.'))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:p-8" aria-labelledby="security-heading">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-ink"><KeyRound size={19} /></span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-ink/40">Account protection</p>
          <h2 id="security-heading" className="mt-1 font-heading text-3xl uppercase text-ink">Security</h2>
          <p className="mt-1 text-sm leading-6 text-ink/50">Change your password without ending your current session.</p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="mt-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map(([name, label, autocomplete]) => <PasswordField key={name} name={name} label={label} autocomplete={autocomplete} value={form[name]} error={errors[name]} visible={Boolean(visible[name])} saving={saving} onChange={onChange} onToggle={() => setVisible((current) => ({ ...current, [name]: !current[name] }))} />)}
        </div>

        {errors.form && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{firstError(errors.form)}</p>}

        <div className="mt-7 flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wide text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
            {saving && <LoaderCircle size={16} className="animate-spin" />}
            {saving ? 'Updating...' : 'Change password'}
          </button>
        </div>
      </form>
    </section>
  )
}

function PasswordField({ name, label, autocomplete, value, error, visible, saving, onChange, onToggle }) {
  return (
    <label htmlFor={`admin-${name}`} className="text-xs font-bold uppercase tracking-[0.14em] text-ink/55">
      {label}
      <div className="relative">
        <input id={`admin-${name}`} name={name} type={visible ? 'text' : 'password'} value={value} onChange={onChange} disabled={saving} autoComplete={autocomplete} aria-invalid={Boolean(error)} aria-describedby={error ? `admin-${name}-error` : undefined} className={inputClass} />
        <button type="button" onClick={onToggle} disabled={saving} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink/45 transition hover:bg-ink/5 hover:text-ink disabled:opacity-40">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
      </div>
      {error && <p id={`admin-${name}-error`} className="mt-2 text-xs font-medium normal-case tracking-normal text-red-600">{firstError(error)}</p>}
    </label>
  )
}
