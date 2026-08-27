const MANILA_TIMEZONE = 'Asia/Manila'

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: MANILA_TIMEZONE,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: MANILA_TIMEZONE,
  hour: 'numeric',
  minute: '2-digit',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: MANILA_TIMEZONE,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const asDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatAttendanceDate = (value, fallback = '—') => {
  const date = asDate(value)
  return date ? dateFormatter.format(date) : fallback
}

export const formatAttendanceTime = (value, fallback = '—') => {
  const date = asDate(value)
  return date ? timeFormatter.format(date) : fallback
}

export const formatAttendanceDateTime = (value, fallback = '—') => {
  const date = asDate(value)
  return date ? dateTimeFormatter.format(date) : fallback
}

export const formatAttendanceDuration = (value, fallback = '—') => {
  if (value === null || value === undefined || value === '') return fallback

  const seconds = Math.max(0, Math.floor(Number(value)))
  if (!Number.isFinite(seconds)) return fallback

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours && minutes) return `${hours} hr${hours === 1 ? '' : 's'} ${minutes} min`
  if (hours) return `${hours} hr${hours === 1 ? '' : 's'}`
  if (minutes) return `${minutes} min`
  return `${seconds} sec`
}
