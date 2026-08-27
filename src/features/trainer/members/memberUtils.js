const MANILA_TIMEZONE = 'Asia/Manila'

export const formatMemberDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { timeZone: MANILA_TIMEZONE, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export const formatMemberDateTime = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { timeZone: MANILA_TIMEZONE, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

export const humanize = (value, fallback = 'Unavailable') => value ? value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : fallback

export const membershipLabel = (membership) => membership?.plan?.name || 'No membership'
