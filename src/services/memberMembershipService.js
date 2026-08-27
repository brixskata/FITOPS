import * as memberMembershipsApi from '../api/memberMemberships'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

export const getCurrentMembership = async () => {
  try {
    const response = await memberMembershipsApi.getCurrentMemberMembership()
    return response.data?.data ?? null
  } catch (error) {
    throw normalizeError(error, 'Unable to load your current Membership.')
  }
}

export const listMemberMemberships = async (params = {}) => {
  try {
    const response = await memberMembershipsApi.getMemberMemberships(params)
    const payload = response.data?.data ?? {}

    return {
      memberships: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.meta ?? {},
    }
  } catch (error) {
    throw normalizeError(error, 'Unable to load your Membership history.')
  }
}

export const showMemberMembership = async (id) => {
  try {
    const response = await memberMembershipsApi.getMemberMembership(id)
    return response.data?.data ?? null
  } catch (error) {
    throw normalizeError(error, 'Unable to load this Membership record.')
  }
}

export const getMemberMembershipErrorMessage = (error, fallback = 'Something went wrong.') => {
  const firstValidationError = Object.values(error?.errors ?? {}).flat()[0]
  return firstValidationError ?? error?.message ?? fallback
}
