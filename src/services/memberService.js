import * as membersApi from '../api/members'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

export const listMembers = async (params = {}) => {
  try {
    return await membersApi.getMembers(params)
  } catch (error) {
    throw normalizeError(error, 'Unable to load members right now.')
  }
}

export const showMember = async (id) => {
  try {
    return await membersApi.getMember(id)
  } catch (error) {
    throw normalizeError(error, 'Unable to load the selected member.')
  }
}

export const createMember = async (payload) => {
  try {
    return await membersApi.createMember(payload)
  } catch (error) {
    throw normalizeError(error, 'Unable to create the member.')
  }
}

export const updateMember = async (id, payload) => {
  try {
    return await membersApi.updateMember(id, payload)
  } catch (error) {
    throw normalizeError(error, 'Unable to update the member.')
  }
}

export const removeMember = async (id) => {
  try {
    return await membersApi.deleteMember(id)
  } catch (error) {
    throw normalizeError(error, 'Unable to delete the member.')
  }
}

export const getMemberStatusOptions = (statuses = []) => [
  'All Status',
  ...statuses.map((status) => status.charAt(0).toUpperCase() + status.slice(1)),
]

export const getMemberMembershipOptions = (options = []) => [
  'All Memberships',
  ...options,
]

export const getMemberErrorMessage = (error, fallback = 'Something went wrong.') => error.message ?? fallback
export const getMemberValidationErrors = (error) => error.errors ?? {}
