import api from './axios'

export const getAdminMemberships = (params) => api.get('/admin/memberships', { params })
export const getAdminMembership = (id) => api.get(`/admin/memberships/${id}`)
export const createAdminMembership = (data) => api.post('/admin/memberships', data)
export const updateAdminMembership = (id, data) => api.put(`/admin/memberships/${id}`, data)
export const updateAdminMembershipStatus = (id, status) => api.patch(`/admin/memberships/${id}/status`, { status })
export const renewAdminMembership = (id) => api.post(`/admin/memberships/${id}/renew`)
