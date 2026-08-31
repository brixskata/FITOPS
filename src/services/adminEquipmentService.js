import * as equipmentApi from '../api/adminEquipment'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

const unwrapEquipment = (response) => response.data?.data ?? null

export const listAdminEquipment = async (params = {}) => {
  try {
    const response = await equipmentApi.getAdminEquipment(params)
    const payload = response.data?.data ?? {}

    return {
      equipment: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.meta ?? {},
      filters: payload.filters ?? {},
    }
  } catch (error) {
    throw normalizeError(error, 'Unable to load Equipment right now.')
  }
}

export const showAdminEquipment = async (id) => {
  try {
    return unwrapEquipment(await equipmentApi.getAdminEquipmentItem(id))
  } catch (error) {
    throw normalizeError(error, 'Unable to load the selected Equipment.')
  }
}

export const createEquipment = async (payload) => {
  try {
    return unwrapEquipment(await equipmentApi.createAdminEquipment(payload))
  } catch (error) {
    throw normalizeError(error, 'Unable to create the Equipment.')
  }
}

export const updateEquipment = async (id, payload) => {
  try {
    return unwrapEquipment(await equipmentApi.updateAdminEquipment(id, payload))
  } catch (error) {
    throw normalizeError(error, 'Unable to update the Equipment.')
  }
}

export const getEquipmentErrorMessage = (error, fallback = 'Something went wrong.') => error?.message ?? fallback
export const getEquipmentValidationErrors = (error) => error?.errors ?? {}
