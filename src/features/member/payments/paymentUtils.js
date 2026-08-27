const MANILA_TIMEZONE = 'Asia/Manila'
const dateFormatter = new Intl.DateTimeFormat('en-PH', { timeZone: MANILA_TIMEZONE, month: 'short', day: 'numeric', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', { timeZone: MANILA_TIMEZONE, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
const asDate = (value) => { if (!value) return null; const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date }
export const formatPaymentDate = (value, fallback = '—') => { if (!value) return fallback; const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+08:00`) : asDate(value); return date ? dateFormatter.format(date) : fallback }
export const formatPaymentDateTime = (value, fallback = '—') => { const date = asDate(value); return date ? dateTimeFormatter.format(date) : fallback }
export const formatPaymentAmount = (value, fallback = '—') => { const amount = Number(value); return Number.isFinite(amount) ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount) : fallback }
export const humanizePaymentLabel = (value, fallback = '—') => value ? String(value).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : fallback
export const paymentStatusClass = (status) => ({ paid: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700', pending: 'border-accent/50 bg-accent/15 text-ink', failed: 'border-red-500/20 bg-red-500/10 text-red-700', refunded: 'border-slate-400/30 bg-slate-400/10 text-slate-700' }[status] || 'border-ink/10 bg-ink/5 text-ink/60')
