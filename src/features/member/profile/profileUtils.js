const MANILA_TIMEZONE = 'Asia/Manila'
const dateFormatter = new Intl.DateTimeFormat('en-PH', { timeZone: MANILA_TIMEZONE, month: 'long', day: 'numeric', year: 'numeric' })
export const formatProfileDate = (value, fallback = '—') => { if (!value) return fallback; const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? new Date(`${value}T00:00:00+08:00`) : new Date(value); return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date) }
export const profileInitials = (profile) => profile?.avatar_initials || String(profile?.name || '').trim().split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'M'
export const statusClass = (status) => ({ active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700', inactive: 'border-slate-400/30 bg-slate-400/10 text-slate-700', suspended: 'border-red-500/20 bg-red-500/10 text-red-700' }[status] || 'border-ink/10 bg-ink/5 text-ink/60')
