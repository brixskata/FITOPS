import api from './axios'

export const getAdminMaintenance = (params) => api.get('/admin/maintenance', { params })
export const getAdminMaintenanceRecord = (id) => api.get('/admin/maintenance/' + id)
export const createAdminMaintenance = (data) => api.post('/admin/maintenance', data)
export const updateAdminMaintenance = (id, data) => api.put('/admin/maintenance/' + id, data)
