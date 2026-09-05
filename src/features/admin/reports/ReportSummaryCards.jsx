import { formatCurrency, formatNumber } from './reportUtils'

export default function ReportSummaryCards({ summary = {} }) {
  const rows = [['Total Revenue', formatCurrency(summary.total_revenue)], ['Total Cost', formatCurrency(summary.total_cost)], ['Gross Profit', formatCurrency(summary.gross_profit)], ['Total Members', formatNumber(summary.total_members)]]
  return <div className="overflow-hidden rounded-2xl border border-ink/10"><table className="w-full text-left text-sm"><thead className="bg-[#fbfbf9]"><tr><th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/45">Metric</th><th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-ink/45">Value</th></tr></thead><tbody>{rows.map(([label, value]) => <tr key={label} className="border-t border-ink/5"><td className="px-4 py-4 font-medium text-ink">{label}</td><td className="px-4 py-4 text-right text-lg font-bold text-ink">{value}</td></tr>)}</tbody></table></div>
}
