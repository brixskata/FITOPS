import api from './axios'

export const getAdminMembershipPlans = (params) => api.get('/admin/membership-plans', { params })
export const getAdminMembershipPlan = (id) => api.get(`/admin/membership-plans/${id}`)
export const createAdminMembershipPlan = (data) => api.post('/admin/membership-plans', data)
export const updateAdminMembershipPlan = (id, data) => api.put(`/admin/membership-plans/${id}`, data)
export const updateAdminMembershipPlanStatus = (id, status) => api.patch(`/admin/membership-plans/${id}/status`, { status })
