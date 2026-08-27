import api from './axios'

export const getMemberProfile = () => api.get('/member/profile')
export const updateMemberProfile = (data) => api.patch('/member/profile', data)
