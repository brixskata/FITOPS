import api from './axios'

export const getAdminAttendance = (params) => api.get('/admin/attendance', { params })
export const getAdminAttendanceRecord = (id) => api.get(`/admin/attendance/${id}`)
export const checkInAdminAttendance = (data) => api.post('/admin/attendance/check-in', data)
export const checkOutAdminAttendance = (id, data = {}) => api.post(`/admin/attendance/${id}/check-out`, data)
