import { DollarSign, TrendingUp, Users, WalletCards } from 'lucide-react'
import { formatCurrency, formatNumber } from './reportUtils'

export default function ReportSummaryCards({ summary = {} }) {
  const cards = [
    { label: 'Total Revenue', value: formatCurrency(summary.total_revenue), context: 'Selected period', icon: DollarSign },
    { label: 'Total Cost', value: formatCurrency(summary.total_cost), context: 'Selected period', icon: WalletCards },
    { label: 'Gross Profit', value: formatCurrency(summary.gross_profit), context: 'Selected period', icon: TrendingUp },
    { label: 'Total Members', value: formatNumber(summary.total_members), context: 'Current', icon: Users },
  ]

  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, context, icon: Icon }) => <div key={label} className="rounded-2xl border border-ink/10 bg-white p-5"><div className="flex items-start justify-between gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-ink"><Icon size={17} /></span><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">{context}</span></div><p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/45">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</p></div>)}</div>
}
