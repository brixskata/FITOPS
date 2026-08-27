import api from './axios'

export const getMemberPayments = (params = {}) => api.get('/member/payments', { params })
export const getMemberPayment = (id) => api.get(`/member/payments/${id}`)
