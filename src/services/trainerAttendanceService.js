import * as trainerAttendanceApi from '../api/trainerAttendance'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

export const listTrainerAttendance = async (params = {}) => {
  try {
    const response = await trainerAttendanceApi.getTrainerAttendance(params)
    const payload = response.data?.data ?? {}

    return {
      attendance: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.meta ?? {},
      filters: payload.filters ?? {},
    }
  } catch (error) {
    throw normalizeError(error, 'Unable to load your assigned members’ attendance right now.')
  }
}

export const showTrainerAttendance = async (id) => {
  try {
    const response = await trainerAttendanceApi.getTrainerAttendanceRecord(id)
    return response.data?.data ?? null
  } catch (error) {
    throw normalizeError(error, 'Unable to load this attendance record.')
  }
}

export const getTrainerAttendanceErrorMessage = (error, fallback = 'Something went wrong.') => {
  const firstValidationError = Object.values(error?.errors ?? {}).flat()[0]
  return firstValidationError ?? error?.message ?? fallback
}
