import * as adminTrainersApi from '../api/adminTrainers'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

export const listAdminTrainers = async (params = {}) => {
  try {
    const response = await adminTrainersApi.getAdminTrainers(params)
    const payload = response.data?.data ?? {}

    return {
      trainers: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.meta ?? {},
      filters: payload.filters ?? {},
    }
  } catch (error) {
    throw normalizeError(error, 'Unable to load Trainers right now.')
  }
}

const unwrapTrainer = (response) => response.data?.data ?? null

export const showAdminTrainer = async (id) => {
  try {
    return unwrapTrainer(await adminTrainersApi.getAdminTrainer(id))
  } catch (error) {
    throw normalizeError(error, 'Unable to load the selected Trainer.')
  }
}

export const createTrainer = async (payload) => {
  try {
    return unwrapTrainer(await adminTrainersApi.createAdminTrainer(payload))
  } catch (error) {
    throw normalizeError(error, 'Unable to create the Trainer.')
  }
}

export const updateTrainer = async (id, payload) => {
  try {
    return unwrapTrainer(await adminTrainersApi.updateAdminTrainer(id, payload))
  } catch (error) {
    throw normalizeError(error, 'Unable to update the Trainer.')
  }
}

export const updateTrainerStatus = async (id, status) => {
  try {
    return unwrapTrainer(await adminTrainersApi.updateAdminTrainerStatus(id, status))
  } catch (error) {
    throw normalizeError(error, 'Unable to update the Trainer status.')
  }
}

export const getTrainerErrorMessage = (error, fallback = 'Something went wrong.') => error?.message ?? fallback
export const getTrainerValidationErrors = (error) => error?.errors ?? {}
