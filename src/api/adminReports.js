import api from './axios'

export const getAdminReportsOverview = (params) => api.get('/admin/reports/overview', { params })
