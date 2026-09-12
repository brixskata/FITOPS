import api from './axios'

export const getAdminProfile = () => api.get('/user')

export const updateAdminProfile = (payload) => api.put('/admin/profile', payload)

export const updateAdminPassword = (payload) => api.put('/admin/password', payload)
