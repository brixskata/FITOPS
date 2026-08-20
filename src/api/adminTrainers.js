import api from './axios'

export const getAdminTrainers = (params) => api.get('/admin/trainers', { params })
export const getAdminTrainer = (id) => api.get(`/admin/trainers/${id}`)
export const createAdminTrainer = (data) => api.post('/admin/trainers', data)
export const updateAdminTrainer = (id, data) => api.put(`/admin/trainers/${id}`, data)
export const updateAdminTrainerStatus = (id, status) => api.patch(`/admin/trainers/${id}/status`, { status })
