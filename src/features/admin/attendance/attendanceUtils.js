const manilaDateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export const formatAttendanceDateTime = (value, fallback = '—') => {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : manilaDateTimeFormatter.format(date)
}

export const formatDuration = (value, fallback = '—') => {
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

export const toManilaDateTimeInput = (value = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(value).reduce((result, part) => ({ ...result, [part.type]: part.value }), {})
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}
