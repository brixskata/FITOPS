export default function LoadingSkeleton() {
  return <div className="space-y-4" aria-label="Loading Trainer members">
    <div className="h-24 animate-pulse rounded-2xl bg-ink/10" />
    <div className="h-16 animate-pulse rounded-2xl bg-ink/10" />
    <div className="hidden overflow-hidden rounded-2xl border border-ink/10 bg-white md:block">
      {[1, 2, 3, 4, 5].map((row) => <div key={row} className="h-20 animate-pulse border-b border-ink/5 bg-ink/[0.025]" />)}
    </div>
    <div className="space-y-3 md:hidden">{[1, 2, 3].map((row) => <div key={row} className="h-48 animate-pulse rounded-2xl bg-ink/10" />)}</div>
  </div>
}
