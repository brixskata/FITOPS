import * as adminDashboardApi from '../api/adminDashboard'

const normalizeError = (error) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? 'Unable to load the Admin Dashboard.',
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

export const getAdminDashboard = async () => {
  try {
    const response = await adminDashboardApi.getAdminDashboard()
    return response.data?.data ?? null
  } catch (error) {
    throw normalizeError(error)
  }
}

export const getAdminDashboardErrorMessage = (error, fallback = 'Unable to load the Admin Dashboard.') => (
  Object.values(error?.errors ?? {}).flat()[0] ?? error?.message ?? fallback
)
