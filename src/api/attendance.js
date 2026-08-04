import api from './axios'; export const getAttendance = (params) => api.get('/attendance', { params })
