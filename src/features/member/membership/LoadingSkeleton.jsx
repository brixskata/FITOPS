export default function LoadingSkeleton() {
  return <div className="space-y-6" aria-label="Loading membership">
    <div className="h-64 animate-pulse rounded-2xl bg-ink/10" />
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-6"><div className="h-8 w-48 animate-pulse rounded bg-ink/5" />{[1, 2, 3].map((item) => <div key={item} className="mt-5 h-16 animate-pulse rounded-xl bg-ink/[0.035]" />)}</div>
  </div>
}
