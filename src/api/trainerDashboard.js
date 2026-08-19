import api from './axios'

export const getTrainerDashboard = () => api.get('/trainer/dashboard')
export const getTrainerProfile = () => api.get('/trainer/profile')
