export const categories = ['cardio', 'strength', 'free_weights', 'functional', 'accessories', 'other']
export const conditions = ['excellent', 'good', 'fair', 'poor', 'damaged']
export const statuses = ['operational', 'under_maintenance', 'out_of_service', 'retired']
export const maintenanceStatuses = ['none', 'scheduled', 'due_soon', 'overdue', 'under_maintenance']

export const labelize = (value) => String(value ?? '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export const emptyEquipmentForm = {
  name: '',
  category: 'cardio',
  brand: '',
  model: '',
  condition: 'good',
  status: 'operational',
  last_maintenance_at: '',
  next_maintenance_at: '',
  maintenance_notes: '',
  notes: '',
}

export const toDateInputValue = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)

  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 10)
}

export const buildEquipmentForm = (equipment = {}) => ({
  name: equipment.name ?? '',
  category: equipment.category ?? 'cardio',
  brand: equipment.brand ?? '',
  model: equipment.model ?? '',
  condition: equipment.condition ?? 'good',
  status: equipment.status ?? 'operational',
  last_maintenance_at: toDateInputValue(equipment.last_maintenance_at),
  next_maintenance_at: toDateInputValue(equipment.next_maintenance_at),
  maintenance_notes: equipment.maintenance_notes ?? '',
  notes: equipment.notes ?? '',
})

export const buildEquipmentPayload = (form) => ({
  name: form.name.trim(),
  category: form.category,
  brand: form.brand.trim() || null,
  model: form.model.trim() || null,
  condition: form.condition,
  status: form.status,
  last_maintenance_at: form.last_maintenance_at || null,
  next_maintenance_at: form.next_maintenance_at || null,
  maintenance_notes: form.maintenance_notes.trim() || null,
  notes: form.notes.trim() || null,
})

export const maintenanceStatusLabel = (value) => value === 'none' ? 'No schedule' : labelize(value)
