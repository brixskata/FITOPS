import api from './axios'; export const getEquipment = (params) => api.get('/equipment', { params })
