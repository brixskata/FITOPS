import * as membershipPlansApi from '../api/adminMembershipPlans'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

export const listAdminMembershipPlans = async (params = {}) => {
  try {
    const response = await membershipPlansApi.getAdminMembershipPlans(params)
    const payload = response.data?.data ?? {}
    return { plans: Array.isArray(payload.data) ? payload.data : [], pagination: payload.meta ?? {}, filters: payload.filters ?? {} }
  } catch (error) {
    throw normalizeError(error, 'Unable to load Membership Plans right now.')
  }
}

const unwrapPlan = (response) => response.data?.data ?? null

export const showAdminMembershipPlan = async (id) => {
  try { return unwrapPlan(await membershipPlansApi.getAdminMembershipPlan(id)) } catch (error) { throw normalizeError(error, 'Unable to load the selected Membership Plan.') }
}

export const createMembershipPlan = async (payload) => {
  try { return unwrapPlan(await membershipPlansApi.createAdminMembershipPlan(payload)) } catch (error) { throw normalizeError(error, 'Unable to create the Membership Plan.') }
}

export const updateMembershipPlan = async (id, payload) => {
  try { return unwrapPlan(await membershipPlansApi.updateAdminMembershipPlan(id, payload)) } catch (error) { throw normalizeError(error, 'Unable to update the Membership Plan.') }
}

export const updateMembershipPlanStatus = async (id, status) => {
  try { return unwrapPlan(await membershipPlansApi.updateAdminMembershipPlanStatus(id, status)) } catch (error) { throw normalizeError(error, 'Unable to update the Membership Plan status.') }
}

export const getMembershipPlanErrorMessage = (error, fallback = 'Something went wrong.') => error?.message ?? fallback
export const getMembershipPlanValidationErrors = (error) => error?.errors ?? {}
