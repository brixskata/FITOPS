export default function LoadingSkeleton() {
  return <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_18px_60px_rgba(18,18,18,0.06)]"><div className="min-w-[1050px] animate-pulse p-5"><div className="h-5 w-full rounded bg-ink/5" />{Array.from({ length: 7 }).map((_, index) => <div key={index} className="mt-5 h-12 rounded-2xl bg-ink/[0.035]" />)}</div></div>
}
