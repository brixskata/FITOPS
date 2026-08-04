import { ArrowUpRight, Sparkles } from 'lucide-react'

export default function AdminPlaceholder({ title }) {
  return (
    <section className="flex min-h-[calc(100vh-164px)] items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-[0_18px_60px_rgba(18,18,18,0.06)] sm:p-14">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-ink shadow-lg shadow-accent/20">
          <Sparkles size={25} />
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-ink/60">Admin module</p>
        <h2 className="mt-3 font-heading text-4xl uppercase tracking-wide text-ink sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink/55">This page is reserved for the {title.toLowerCase()} module. The shared FitOps admin layout is ready for its future feature content.</p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-ink/50"><ArrowUpRight size={14} /> Coming in the next milestone</div>
      </div>
    </section>
  )
}
