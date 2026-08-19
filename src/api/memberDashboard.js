import api from './axios'

export const getMemberDashboard = () => api.get('/member/dashboard')
