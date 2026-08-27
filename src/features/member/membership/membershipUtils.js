const dateFormatter = new Intl.DateTimeFormat('en-PH', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })

export const formatMembershipDate = (value, fallback = '—') => {
  if (!value) return fallback
  const datePart = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  const date = new Date(`${datePart || value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date)
}

export const formatMembershipPrice = (value, fallback = '—') => {
  if (value === null || value === undefined || value === '') return fallback
  const amount = Number(value)
  return Number.isFinite(amount) ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount) : fallback
}

export const humanizeMembershipStatus = (value, fallback = 'Unavailable') => value ? String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : fallback
