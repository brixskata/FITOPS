import * as attendanceApi from '../api/adminAttendance'
import { listMembers } from './memberService'
import { listTrainers } from './trainerService'

const normalizeError = (error, fallbackMessage) => {
  if (typeof error?.status === 'number' && 'isNetworkError' in error) {
    return { ...error, message: error.message ?? fallbackMessage }
  }

  return {
    status: error.response?.status ?? 0,
    message: error.response?.data?.message ?? error.message ?? fallbackMessage,
    errors: error.response?.data?.errors ?? {},
    isNetworkError: !error.response,
  }
}

const unwrapAttendance = (response) => response.data?.data ?? null

export const listAdminAttendance = async (params = {}) => {
  try {
    const response = await attendanceApi.getAdminAttendance(params)
    const payload = response.data?.data ?? {}
    return {
      attendance: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.meta ?? {},
      filters: payload.filters ?? {},
    }
  } catch (error) {
    throw normalizeError(error, 'Unable to load attendance records right now.')
  }
}

export const showAdminAttendance = async (id) => {
  try {
    return unwrapAttendance(await attendanceApi.getAdminAttendanceRecord(id))
  } catch (error) {
    throw normalizeError(error, 'Unable to load the selected attendance record.')
  }
}

export const checkInMember = async (payload) => {
  try {
    return unwrapAttendance(await attendanceApi.checkInAdminAttendance(payload))
  } catch (error) {
    throw normalizeError(error, 'Unable to check in the selected member.')
  }
}

export const checkOutMember = async (id, payload = {}) => {
  try {
    return unwrapAttendance(await attendanceApi.checkOutAdminAttendance(id, payload))
  } catch (error) {
    throw normalizeError(error, 'Unable to check out the selected member.')
  }
}

export const loadAttendanceOptions = async () => {
  try {
    const [firstMembersResponse, trainers] = await Promise.all([
      listMembers({ page: 1, per_page: 25, status: 'all', membership: 'all' }),
      listTrainers(),
    ])
    const firstPayload = firstMembersResponse.data?.data ?? {}
    const lastPage = Math.max(1, Number(firstPayload.meta?.last_page ?? 1))
    const additionalResponses = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, index) => listMembers({
        page: index + 2,
        per_page: 25,
        status: 'all',
        membership: 'all',
      })),
    )

    const members = [
      ...(Array.isArray(firstPayload.data) ? firstPayload.data : []),
      ...additionalResponses.flatMap((response) => {
        const payload = response.data?.data ?? {}
        return Array.isArray(payload.data) ? payload.data : []
      }),
    ]

    return { members, trainers: Array.isArray(trainers) ? trainers : [] }
  } catch (error) {
    throw normalizeError(error, 'Unable to load Member and Trainer options.')
  }
}

export const getAttendanceErrorMessage = (error, fallback = 'Something went wrong.') => {
  const firstValidationError = Object.values(error?.errors ?? {}).flat()[0]
  return firstValidationError ?? error?.message ?? fallback
}

export const getAttendanceValidationErrors = (error) => error?.errors ?? {}
