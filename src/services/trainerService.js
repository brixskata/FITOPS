import * as trainersApi from '../api/trainers'

const normalizeError = (error) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? 'Unable to load Trainers.',
  isNetworkError: !error.response,
})

export const listTrainers = async () => {
  try {
    const response = await trainersApi.getTrainers()
    return Array.isArray(response.data?.data) ? response.data.data : []
  } catch (error) {
    throw normalizeError(error)
  }
}
