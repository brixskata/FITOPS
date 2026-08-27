import api from './axios'

export const getMemberAttendance = (params = {}) => api.get('/member/attendance', { params })

export const getMemberAttendanceRecord = (id) => api.get(`/member/attendance/${id}`)
