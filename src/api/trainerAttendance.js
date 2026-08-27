import api from './axios'

export const getTrainerAttendance = (params = {}) => api.get('/trainer/attendance', { params })

export const getTrainerAttendanceRecord = (id) => api.get(`/trainer/attendance/${id}`)
