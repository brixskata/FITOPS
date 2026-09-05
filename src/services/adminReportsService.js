import * as adminReportsApi from '../api/adminReports'

const normalizeError = (error) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? 'Unable to load Reports.',
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

export const getAdminReports = async (params) => {
  try {
    const response = await adminReportsApi.getAdminReportsOverview(params)
    return response.data?.data ?? null
  } catch (error) {
    throw normalizeError(error)
  }
}

export const getAdminReportsErrorMessage = (error) => (
  Object.values(error?.errors ?? {}).flat()[0]
  ?? (error?.isNetworkError ? 'Unable to connect to the Reports server.' : error?.message)
  ?? 'We could not load Reports right now.'
)
