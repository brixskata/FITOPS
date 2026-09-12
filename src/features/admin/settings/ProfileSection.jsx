import { Save, UserRound } from 'lucide-react'

const inputClass = 'mt-2 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:bg-ink/[0.03]'

const firstError = (value) => Array.isArray(value) ? value[0] : value

export default function ProfileSection({ form, errors, saving, onChange, onSubmit }) {
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:p-8" aria-labelledby="profile-heading">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-ink"><UserRound size={19} /></span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-ink/40">Account</p>
          <h2 id="profile-heading" className="mt-1 font-heading text-3xl uppercase text-ink">Profile</h2>
          <p className="mt-1 text-sm leading-6 text-ink/50">Update the name and email used for your Admin account.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="name" label="Name" value={form.name} error={errors.name} onChange={onChange} disabled={saving} />
          <Field name="email" label="Email" type="email" value={form.email} error={errors.email} onChange={onChange} disabled={saving} />
        </div>

        {errors.form && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{firstError(errors.form)}</p>}

        <div className="mt-7 flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wide text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  )
}

function Field({ name, label, type = 'text', value, error, onChange, disabled }) {
  return (
    <label htmlFor={`admin-${name}`} className="text-xs font-bold uppercase tracking-[0.14em] text-ink/55">
      {label}
      <input id={`admin-${name}`} name={name} type={type} value={value} onChange={onChange} disabled={disabled} autoComplete={name === 'email' ? 'email' : 'name'} aria-invalid={Boolean(error)} aria-describedby={error ? `admin-${name}-error` : undefined} className={inputClass} />
      {error && <p id={`admin-${name}-error`} className="mt-2 text-xs font-medium normal-case tracking-normal text-red-600">{firstError(error)}</p>}
    </label>
  )
}
