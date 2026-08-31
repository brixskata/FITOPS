import api from './axios'

export const getAdminEquipment = (params) => api.get('/admin/equipment', { params })
export const getAdminEquipmentItem = (id) => api.get('/admin/equipment/' + id)
export const createAdminEquipment = (data) => api.post('/admin/equipment', data)
export const updateAdminEquipment = (id, data) => api.put('/admin/equipment/' + id, data)
