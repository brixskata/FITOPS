import * as maintenanceApi from '../api/adminMaintenance'
import { listAdminEquipment } from './adminEquipmentService'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

const unwrapRecord = (response) => response.data?.data ?? null

export const listAdminMaintenance = async (params = {}) => {
  try {
    const requestParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== 'all' && value !== '' && value !== null && value !== undefined),
    )
    const response = await maintenanceApi.getAdminMaintenance(requestParams)
    const payload = response.data?.data ?? {}

    return {
      records: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.meta ?? {},
      filters: payload.filters ?? {},
    }
  } catch (error) {
    throw normalizeError(error, 'Unable to load maintenance records right now.')
  }
}

export const showAdminMaintenance = async (id) => {
  try {
    return unwrapRecord(await maintenanceApi.getAdminMaintenanceRecord(id))
  } catch (error) {
    throw normalizeError(error, 'Unable to load the selected maintenance record.')
  }
}

export const createMaintenance = async (payload) => {
  try {
    return unwrapRecord(await maintenanceApi.createAdminMaintenance(payload))
  } catch (error) {
    throw normalizeError(error, 'Unable to create the maintenance record.')
  }
}

export const updateMaintenance = async (id, payload) => {
  try {
    return unwrapRecord(await maintenanceApi.updateAdminMaintenance(id, payload))
  } catch (error) {
    throw normalizeError(error, 'Unable to update the maintenance record.')
  }
}

export const listMaintenanceEquipment = async () => {
  try {
    const firstPage = await listAdminEquipment({ page: 1, per_page: 25, search: '', category: 'all', condition: 'all', status: 'all', maintenance_status: 'all' })
    const pages = Array.from({ length: Math.max(0, Number(firstPage.pagination?.last_page ?? 1) - 1) }, (_, index) => index + 2)
    const additionalPages = await Promise.all(pages.map((page) => listAdminEquipment({ page, per_page: 25, search: '', category: 'all', condition: 'all', status: 'all', maintenance_status: 'all' })))

    return [firstPage.equipment, ...additionalPages.map((result) => result.equipment)].flat()
  } catch (error) {
    throw normalizeError(error, 'Unable to load Equipment options.')
  }
}

export const getMaintenanceErrorMessage = (error, fallback = 'Something went wrong.') => {
  const firstValidationError = Object.values(error?.errors ?? {}).flat()[0]
  return firstValidationError ?? error?.message ?? fallback
}

export const getMaintenanceValidationErrors = (error) => error?.errors ?? {}
