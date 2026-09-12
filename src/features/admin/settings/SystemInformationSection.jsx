import { Info } from 'lucide-react'

const information = [
  ['Application', 'FitOps'],
  ['Currency', 'Philippine Peso'],
  ['Timezone', 'Asia/Manila'],
]

export default function SystemInformationSection() {
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:p-8" aria-labelledby="system-information-heading">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-ink"><Info size={19} /></span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-ink/40">Read-only</p>
          <h2 id="system-information-heading" className="mt-1 font-heading text-3xl uppercase text-ink">System information</h2>
          <p className="mt-1 text-sm leading-6 text-ink/50">The current FitOps application defaults.</p>
        </div>
      </div>

      <dl className="mt-8 grid gap-5 sm:grid-cols-3">
        {information.map(([label, value]) => <div key={label} className="rounded-2xl border border-ink/10 bg-ink/[0.02] px-4 py-4"><dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">{label}</dt><dd className="mt-2 text-sm font-semibold text-ink">{value}</dd></div>)}
      </dl>
    </section>
  )
}
