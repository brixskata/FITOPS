import api from './axios'; export const getMemberships = () => api.get('/memberships'); export const createMembership = (data) => api.post('/memberships', data)
