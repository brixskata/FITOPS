import * as trainerMembersApi from '../api/trainerMembers'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

export const listTrainerMembers = async (params = {}) => {
  try {
    const response = await trainerMembersApi.getTrainerMembers(params)
    const payload = response.data?.data ?? {}

    return {
      members: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.meta ?? {},
      filters: payload.filters ?? {},
    }
  } catch (error) {
    throw normalizeError(error, 'Unable to load your roster right now.')
  }
}

export const showTrainerMember = async (id) => {
  try {
    const response = await trainerMembersApi.getTrainerMember(id)
    return response.data?.data ?? null
  } catch (error) {
    throw normalizeError(error, 'Unable to load this Member.')
  }
}

export const getTrainerMembersErrorMessage = (error, fallback = 'Something went wrong.') => {
  const firstValidationError = Object.values(error?.errors ?? {}).flat()[0]
  return firstValidationError ?? error?.message ?? fallback
}
