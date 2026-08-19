import * as memberDashboardApi from '../api/memberDashboard'

const normalizeError = (error) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? 'Unable to load your dashboard.',
  isNetworkError: !error.response,
})

export const getMemberDashboard = async () => {
  try {
    const response = await memberDashboardApi.getMemberDashboard()
    return response.data.data
  } catch (error) {
    throw normalizeError(error)
  }
}
