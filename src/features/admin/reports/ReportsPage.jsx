import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { getAdminReports, getAdminReportsErrorMessage } from '../../../services/adminReportsService'
import ReportFilters from './ReportFilters'
import ReportSummaryCards from './ReportSummaryCards'
import { MembershipsReport } from './ReportSections'
import { firstOfMonth, generateReportPdf, initialReportFilters, lastMonthRange, shiftDate, todayManila } from './reportUtils'

const presetFilters = (preset) => {
  const today = todayManila()
  if (preset === 'this_month') return { date_from: firstOfMonth(today), date_to: today, group_by: 'day' }
  if (preset === 'last_month') return { ...lastMonthRange(today), group_by: 'day' }
  if (preset === 'last_7_days') return { date_from: shiftDate(today, -6), date_to: today, group_by: 'day' }
  if (preset === 'last_30_days') return { date_from: shiftDate(today, -29), date_to: today, group_by: 'day' }
  return null
}

function LoadingState() {
  return <div className="space-y-6" aria-label="Loading Reports"><div className="h-36 animate-pulse rounded-3xl bg-ink/10" /><div className="h-96 animate-pulse rounded-3xl bg-ink/10" /></div>
}

function ErrorState({ message, onRetry }) {
  return <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><h2 className="font-heading text-3xl uppercase text-amber-950">Reports unavailable</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-amber-900">{message}</p><button type="button" onClick={onRetry} className="mt-5 rounded-full border border-amber-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-950 transition hover:bg-amber-100">Retry</button></div>
}

export default function ReportsPage() {
  const initial = initialReportFilters()
  const [filters, setFilters] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [preset, setPreset] = useState('this_month')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reload, setReload] = useState(0)
  const [filterError, setFilterError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getAdminReports(filters)
      .then((data) => { if (active) setReport(data) })
      .catch((requestError) => { if (active) setError(requestError) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [filters, reload])

  const applyFilters = (next, nextPreset = 'custom') => {
    if (!next.date_from || !next.date_to) return setFilterError('Please choose both a start and end date.')
    if (next.date_to < next.date_from) return setFilterError('The end date cannot be earlier than the start date.')
    setFilterError('')
    setPreset(nextPreset)
    setDraft(next)
    setFilters(next)
  }

  const updateDraft = (name, value) => {
    setFilterError('')
    setPreset('custom')
    setDraft((current) => ({ ...current, [name]: value }))
  }

  const selectPreset = (value) => {
    if (value === 'custom') return setPreset('custom')
    const next = presetFilters(value)
    if (next) applyFilters(next, value)
  }

  return <div className="space-y-6">
    <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Admin workspace</p>
      <h1 className="mt-2 font-heading text-4xl uppercase tracking-wide text-ink sm:text-5xl">Reports</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">Generate business and financial reports for a selected Manila calendar period.</p>
    </div>

    <section className="rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Report configuration</p><h2 className="mt-2 font-heading text-3xl uppercase tracking-wide text-ink">Choose report period</h2><p className="mt-2 text-sm text-ink/55">Select the calendar range and grouping for the financial report.</p></div>
        <button type="button" disabled={!report || loading} onClick={() => generateReportPdf(report, filters)} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"><FileText size={17} /> Generate PDF</button>
      </div>
      <div className="mt-5"><ReportFilters filters={filters} draft={draft} preset={preset} error={filterError} loading={loading} embedded onPreset={selectPreset} onDraftChange={updateDraft} onApply={() => applyFilters(draft)} /></div>
    </section>

    {loading && !report ? <LoadingState /> : error ? <ErrorState message={getAdminReportsErrorMessage(error)} onRetry={() => setReload((value) => value + 1)} /> : report ? <section className="rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(18,18,18,0.05)] sm:p-8">
      <div className="border-b border-ink/10 pb-6"><p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">FitOps · Gym Management System</p><h2 className="mt-2 font-heading text-4xl uppercase tracking-wide text-ink">Business Financial Report</h2><p className="mt-3 text-sm text-ink/55">Selected period: {report.period?.date_from} — {report.period?.date_to}</p><p className="mt-1 text-xs text-ink/40">Generated: {todayManila()} · Reporting timezone: {report.period?.timezone || 'Asia/Manila'}</p></div>
      <div className="mt-7 space-y-8"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Executive summary</p><ReportSummaryCards summary={report.summary} /></div><div><h2 className="mb-4 font-heading text-3xl uppercase tracking-wide text-ink">Membership Sales</h2><MembershipsReport report={{ membership_sales: report.membership_sales }} /></div></div>
    </section> : <ErrorState message="The Reports API returned no report data." onRetry={() => setReload((value) => value + 1)} />}
  </div>
}
