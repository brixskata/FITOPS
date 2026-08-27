import * as memberAttendanceApi from '../api/memberAttendance'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

export const listMemberAttendance = async (params = {}) => {
  try {
    const response = await memberAttendanceApi.getMemberAttendance(params)
    const payload = response.data?.data ?? {}

    return {
      attendance: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.meta ?? {},
      filters: payload.filters ?? {},
    }
  } catch (error) {
    throw normalizeError(error, 'Unable to load your attendance history right now.')
  }
}

export const showMemberAttendance = async (id) => {
  try {
    const response = await memberAttendanceApi.getMemberAttendanceRecord(id)
    return response.data?.data ?? null
  } catch (error) {
    throw normalizeError(error, 'Unable to load this attendance record.')
  }
}

export const getMemberAttendanceErrorMessage = (error, fallback = 'Something went wrong.') => {
  const firstValidationError = Object.values(error?.errors ?? {}).flat()[0]
  return firstValidationError ?? error?.message ?? fallback
}
