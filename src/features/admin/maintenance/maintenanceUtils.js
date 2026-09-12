export const maintenanceTypes = ['preventive', 'repair', 'inspection', 'cleaning', 'replacement', 'other']
export const maintenanceStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled']

export const typeLabels = {
  preventive: 'Preventive Maintenance',
  repair: 'Repair',
  inspection: 'Inspection',
  cleaning: 'Cleaning / Lubrication',
  replacement: 'Part Replacement',
  other: 'Other',
}

export const statusLabels = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const labelForType = (value) => typeLabels[value] || 'Other'
export const labelForStatus = (value) => statusLabels[value] || 'Unknown'

export const emptyMaintenanceForm = {
  equipment_id: '',
  maintenance_date: '',
  maintenance_type: 'preventive',
  cost: '0.00',
  status: 'scheduled',
  description: '',
  notes: '',
}

export const buildMaintenanceForm = (record = {}) => ({
  equipment_id: record.equipment_id ?? record.equipment?.id ?? '',
  maintenance_date: record.maintenance_date ?? '',
  maintenance_type: record.maintenance_type ?? 'preventive',
  cost: record.cost ?? '0.00',
  status: record.status ?? 'scheduled',
  description: record.description ?? '',
  notes: record.notes ?? '',
})

export const buildMaintenancePayload = (form) => ({
  equipment_id: Number(form.equipment_id),
  maintenance_date: form.maintenance_date,
  maintenance_type: form.maintenance_type,
  cost: Number(form.cost),
  status: form.status,
  description: form.description.trim(),
  notes: form.notes.trim() || null,
})

export const formatDate = (value) => value
  ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  : '—'

export const formatDateTime = (value) => value
  ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  : '—'

export const formatCost = (value) => Number(value ?? 0).toLocaleString('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
})
