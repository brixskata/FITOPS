import api from './axios'

export const getTrainerMembers = (params = {}) => api.get('/trainer/members', { params })

export const getTrainerMember = (id) => api.get(`/trainer/members/${id}`)
