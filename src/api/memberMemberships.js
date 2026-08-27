import api from './axios'

export const getCurrentMemberMembership = () => api.get('/member/membership')

export const getMemberMemberships = (params = {}) => api.get('/member/memberships', { params })

export const getMemberMembership = (id) => api.get(`/member/memberships/${id}`)
