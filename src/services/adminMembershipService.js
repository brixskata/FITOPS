import * as membershipsApi from '../api/adminMemberships'
import { listMembers } from './memberService'
import { listAdminMembershipPlans } from './adminMembershipPlanService'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

const unwrapMembership = (response) => response.data?.data ?? null

export const listAdminMemberships = async (params = {}) => {
  try {
    const response = await membershipsApi.getAdminMemberships(params)
    const payload = response.data?.data ?? {}
    return {
      memberships: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.meta ?? {},
      filters: payload.filters ?? {},
    }
  } catch (error) {
    throw normalizeError(error, 'Unable to load memberships right now.')
  }
}

export const showAdminMembership = async (id) => {
  try { return unwrapMembership(await membershipsApi.getAdminMembership(id)) } catch (error) { throw normalizeError(error, 'Unable to load the selected membership.') }
}

export const createMembership = async (payload) => {
  try { return unwrapMembership(await membershipsApi.createAdminMembership(payload)) } catch (error) { throw normalizeError(error, 'Unable to create the membership.') }
}

export const updateMembership = async (id, payload) => {
  try { return unwrapMembership(await membershipsApi.updateAdminMembership(id, payload)) } catch (error) { throw normalizeError(error, 'Unable to update the membership.') }
}

export const updateMembershipStatus = async (id, status) => {
  try { return unwrapMembership(await membershipsApi.updateAdminMembershipStatus(id, status)) } catch (error) { throw normalizeError(error, 'Unable to update the membership status.') }
}

export const renewMembership = async (id) => {
  try { return unwrapMembership(await membershipsApi.renewAdminMembership(id)) } catch (error) { throw normalizeError(error, 'Unable to renew the membership.') }
}

export const loadMembershipFormOptions = async () => {
  try {
    const [membersResponse, plansResponse] = await Promise.all([
      listMembers({ page: 1, per_page: 25, status: 'active' }),
      listAdminMembershipPlans({ page: 1, per_page: 25, status: 'active' }),
    ])
    const membersPayload = membersResponse.data?.data ?? {}
    const memberPages = Math.max(1, Number(membersPayload.meta?.last_page ?? 1))
    const planPages = Math.max(1, Number(plansResponse.pagination?.last_page ?? 1))
    const [additionalMemberResponses, additionalPlanResponses] = await Promise.all([
      Promise.all(Array.from({ length: memberPages - 1 }, (_, index) => listMembers({ page: index + 2, per_page: 25, status: 'active' }))),
      Promise.all(Array.from({ length: planPages - 1 }, (_, index) => listAdminMembershipPlans({ page: index + 2, per_page: 25, status: 'active' }))),
    ])

    return {
      members: [
        ...(Array.isArray(membersPayload.data) ? membersPayload.data : []),
        ...additionalMemberResponses.flatMap((response) => {
          const payload = response.data?.data ?? {}
          return Array.isArray(payload.data) ? payload.data : []
        }),
      ],
      plans: [
        ...(plansResponse.plans ?? []),
        ...additionalPlanResponses.flatMap((response) => response.plans ?? []),
      ],
    }
  } catch (error) {
    throw normalizeError(error, 'Unable to load member and plan options.')
  }
}

export const getMembershipErrorMessage = (error, fallback = 'Something went wrong.') => error?.message ?? fallback
export const getMembershipValidationErrors = (error) => error?.errors ?? {}
