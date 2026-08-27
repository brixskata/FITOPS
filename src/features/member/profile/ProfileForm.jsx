import { Save, X } from 'lucide-react'

const fields = [
  ['name', 'Full name', 'text'],
  ['email', 'Email address', 'email'],
  ['phone', 'Phone number', 'text'],
  ['address', 'Address', 'textarea'],
  ['emergency_contact_name', 'Emergency contact name', 'text'],
  ['emergency_contact_phone', 'Emergency contact phone', 'text'],
]
const inputClass = 'mt-2 w-full rounded-xl border border-ink/10 bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20'

export default function ProfileForm({ form, errors, saving, onChange, onSubmit, onCancel }) {
  return <form onSubmit={onSubmit} className="rounded-2xl border border-ink/10 bg-white p-6 shadow-[0_16px_50px_rgba(18,18,18,0.04)] sm:p-8"><div className="flex items-center justify-between gap-4"><div><h3 className="font-heading text-3xl uppercase text-ink">Edit profile</h3><p className="mt-1 text-sm text-ink/50">Update your contact information.</p></div><button type="button" onClick={onCancel} disabled={saving} aria-label="Cancel profile editing" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/55 transition hover:border-accent disabled:opacity-40"><X size={18} /></button></div><div className="mt-7 grid gap-5 sm:grid-cols-2">{fields.map(([name, label, type]) => <label key={name} className={`${type === 'textarea' ? 'sm:col-span-2' : ''} text-xs font-semibold uppercase tracking-[0.14em] text-ink/40`}>{label}{type === 'textarea' ? <textarea name={name} value={form[name]} onChange={onChange} rows={3} className={`${inputClass} resize-y`} /> : <input name={name} type={type} value={form[name]} onChange={onChange} className={inputClass} />}{errors[name] && <p className="mt-2 text-xs font-medium normal-case tracking-normal text-rose-600">{errors[name][0]}</p>}</label>)}</div><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} disabled={saving} className="rounded-xl border border-ink/10 px-5 py-3 text-sm font-bold text-ink transition hover:border-accent disabled:opacity-40">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50"><Save size={16} />{saving ? 'Saving...' : 'Save changes'}</button></div></form>
}
