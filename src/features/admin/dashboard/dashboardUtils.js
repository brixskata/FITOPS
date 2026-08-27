const MANILA_TIMEZONE = 'Asia/Manila'

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: MANILA_TIMEZONE,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: MANILA_TIMEZONE,
  month: 'short',
  day: 'numeric',
})

export const formatCurrency = (value) => new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
}).format(Number(value ?? 0))

export const formatDateTime = (value, fallback = '—') => {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : dateTimeFormatter.format(date)
}

export const formatTrendDate = (value, fallback = '—') => {
  if (!value) return fallback
  const date = new Date(`${value}T00:00:00+08:00`)
  return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date)
}

export const formatDuration = (seconds, fallback = 'No completed visits') => {
  if (seconds === null || seconds === undefined) return fallback
  const totalMinutes = Math.max(0, Math.round(Number(seconds) / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (!hours) return `${minutes} min`
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

export const humanize = (value, fallback = '—') => value ? String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : fallback

export const statusClass = (status) => ({
  active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  paid: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  expired: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  pending: 'border-accent/50 bg-accent/15 text-ink',
  cancelled: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  failed: 'border-red-500/20 bg-red-500/10 text-red-700',
  refunded: 'border-slate-400/30 bg-slate-400/10 text-slate-700',
}[status] || 'border-ink/10 bg-ink/5 text-ink/60')
