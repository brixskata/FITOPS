import * as adminSettingsApi from '../api/adminSettings'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

const getUserFromResponse = (response) => response.data?.user ?? response.data?.data ?? null

export const getAdminProfile = async () => {
  try {
    const response = await adminSettingsApi.getAdminProfile()
    return getUserFromResponse(response)
  } catch (error) {
    throw normalizeError(error, 'Unable to load your profile.')
  }
}

export const saveAdminProfile = async (payload) => {
  try {
    const response = await adminSettingsApi.updateAdminProfile(payload)
    return getUserFromResponse(response)
  } catch (error) {
    throw normalizeError(error, 'Unable to update your profile.')
  }
}

export const changeAdminPassword = async (payload) => {
  try {
    const response = await adminSettingsApi.updateAdminPassword(payload)
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to update your password.')
  }
}

export const getAdminSettingsErrorMessage = (error, fallbackMessage = 'Something went wrong. Please try again.') => (
  Object.values(error?.errors ?? {}).flat()[0] ?? error?.message ?? fallbackMessage
)
