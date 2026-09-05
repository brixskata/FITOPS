import { formatCurrency, formatNumber } from './reportUtils'

function ReportCard({ title, children }) { return <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white"><div className="border-b border-ink/10 bg-[#fbfbf9] px-5 py-4"><h2 className="font-heading text-2xl uppercase tracking-wide text-ink">{title}</h2></div><div className="p-5">{children}</div></section> }
function Table({ headers, rows, empty = 'No data available for this period.' }) { return rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr>{headers.map((header) => <th key={header} className="border-b border-ink/10 px-3 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink/45">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.key || index} className="border-b border-ink/5 last:border-0"><>{row.cells.map((cell, cellIndex) => <td key={cellIndex} className={`px-3 py-3 ${cellIndex === 0 ? 'font-medium text-ink' : 'text-ink/65'}`}>{cell}</td>)}</></tr>)}</tbody></table></div> : <p className="text-sm text-ink/50">{empty}</p> }
export function MembershipsReport({ report = {} }) {
  const plans = (report.membership_sales || []).map((item) => ({
    key: item.plan_id,
    cells: [
      item.plan_name,
      formatNumber(item.memberships_sold),
      formatCurrency(item.revenue),
      formatCurrency(item.cost),
      formatCurrency(item.profit),
    ],
  }))

  return <ReportCard title="Membership Sales"><Table headers={['Plan', 'Memberships Sold', 'Revenue', 'Cost', 'Gross Profit']} rows={plans} empty="No paid membership sales in this period." /></ReportCard>
}
