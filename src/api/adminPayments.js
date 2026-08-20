import api from './axios'

export const getAdminPayments = (params) => api.get('/admin/payments', { params })
export const getAdminPayment = (id) => api.get(`/admin/payments/${id}`)
export const createAdminPayment = (data) => api.post('/admin/payments', data)
export const updateAdminPaymentStatus = (id, status, paidAt) => api.patch(`/admin/payments/${id}/status`, { status, ...(paidAt ? { paid_at: paidAt } : {}) })
