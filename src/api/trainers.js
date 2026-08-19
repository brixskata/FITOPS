import api from './axios'

export const getTrainers = () => api.get('/trainers')
