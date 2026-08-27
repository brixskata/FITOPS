import api from './axios'

export const updateMemberPassword = (payload) => api.patch('/member/password', payload)
