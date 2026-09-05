import { jsPDF } from 'jspdf'

const MANILA_TIMEZONE = 'Asia/Manila'

export const todayManila = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: MANILA_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(({ type, value }) => [type, value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}
export const shiftDate = (value, days) => { const date = new Date(`${value}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10) }
export const firstOfMonth = (value) => `${value.slice(0, 7)}-01`
export const lastMonthRange = (today) => { const date = new Date(`${firstOfMonth(today)}T00:00:00Z`); date.setUTCDate(0); const lastDay = date.toISOString().slice(0, 10); return { date_from: `${lastDay.slice(0, 7)}-01`, date_to: lastDay } }
export const initialReportFilters = () => { const today = todayManila(); return { date_from: firstOfMonth(today), date_to: today, group_by: 'day' } }
export const formatCurrency = (value) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(value ?? 0))
export const formatNumber = (value) => new Intl.NumberFormat('en-PH').format(Number(value ?? 0))
export const humanize = (value) => value ? String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : '—'

export const generateReportPdf = (report, filters) => {
  const pdf = new jsPDF(); let y = 18; const margin = 16
  const text = (value, size = 10, bold = false) => { pdf.setFont('helvetica', bold ? 'bold' : 'normal'); pdf.setFontSize(size); pdf.text(pdf.splitTextToSize(String(value ?? '—'), 178), margin, y); y += size * 0.55 + 4 }
  const section = (title) => { if (y > 270) { pdf.addPage(); y = 18 }; pdf.setFillColor(255, 230, 0); pdf.rect(margin, y - 5, 178, 8, 'F'); text(title.toUpperCase(), 12, true) }
  const list = (items) => (items?.length ? items : [{ metric: 'No data available', value: '—' }]).forEach((item) => { if (y > 275) { pdf.addPage(); y = 18 }; text(Object.entries(item).map(([key, value]) => `${humanize(key)}: ${value}`).join(' | '), 8) })
  text('FITOPS', 20, true); text('BUSINESS FINANCIAL REPORT', 15, true); text(`Reporting period: ${filters.date_from} to ${filters.date_to}`, 9); text(`Generated: ${todayManila()} | Grouped by: ${filters.group_by}`, 9)
  section('Summary'); list(Object.entries(report.summary || {}).map(([metric, value]) => ({ metric, value: metric === 'total_members' ? formatNumber(value) : formatCurrency(value) })))
  section('Membership Sales'); list((report.membership_sales || []).map((item) => ({ plan: item.plan_name, memberships_sold: item.memberships_sold, revenue: formatCurrency(item.revenue), cost: formatCurrency(item.cost), gross_profit: formatCurrency(item.profit) })))
  pdf.save(`FitOps-Business-Financial-Report-${filters.date_from}-to-${filters.date_to}.pdf`)
}
