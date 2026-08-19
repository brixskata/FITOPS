import * as trainerDashboardApi from '../api/trainerDashboard'

const normalizeError = (error) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? 'Unable to load the Trainer workspace.',
  isNetworkError: !error.response,
})

const unwrap = (response) => response.data.data

export const getTrainerDashboard = async () => {
  try {
    return unwrap(await trainerDashboardApi.getTrainerDashboard())
  } catch (error) {
    throw normalizeError(error)
  }
}

export const getTrainerProfile = async () => {
  try {
    return unwrap(await trainerDashboardApi.getTrainerProfile())
  } catch (error) {
    throw normalizeError(error)
  }
}
