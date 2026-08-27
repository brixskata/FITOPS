import * as memberPasswordApi from '../api/memberPassword'

const normalizeError = (error) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? 'Unable to update your password.',
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

export const updateMemberPassword = async (payload) => {
  try {
    const response = await memberPasswordApi.updateMemberPassword(payload)
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export const getMemberPasswordErrorMessage = (error, fallback = 'Unable to update your password.') => (
  Object.values(error?.errors ?? {}).flat()[0] ?? error?.message ?? fallback
)
