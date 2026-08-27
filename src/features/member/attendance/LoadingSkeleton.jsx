export default function LoadingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_16px_50px_rgba(18,18,18,0.04)]" aria-label="Loading attendance history">
      <div className="animate-pulse border-b border-ink/10 p-5 sm:p-6"><div className="h-10 w-56 rounded-xl bg-ink/5" /></div>
      <div className="hidden animate-pulse p-6 md:block"><div className="h-5 rounded-lg bg-ink/5" />{Array.from({ length: 5 }).map((_, index) => <div key={index} className="mt-5 h-12 rounded-xl bg-ink/[0.035]" />)}</div>
      <div className="divide-y divide-ink/10 md:hidden">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="animate-pulse p-5"><div className="h-4 w-32 rounded bg-ink/5" /><div className="mt-4 h-20 rounded-xl bg-ink/[0.035]" /></div>)}</div>
    </div>
  )
}
