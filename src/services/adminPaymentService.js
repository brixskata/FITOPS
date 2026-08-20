import * as paymentsApi from '../api/adminPayments'
import { listAdminMemberships } from './adminMembershipService'

const normalizeError = (error, fallbackMessage) => ({
  status: error.response?.status ?? 0,
  message: error.response?.data?.message ?? error.message ?? fallbackMessage,
  errors: error.response?.data?.errors ?? {},
  isNetworkError: !error.response,
})

const unwrapPayment = (response) => response.data?.data ?? null

export const listAdminPayments = async (params = {}) => {
  try {
    const response = await paymentsApi.getAdminPayments(params)
    const payload = response.data?.data ?? {}
    return { payments: Array.isArray(payload.data) ? payload.data : [], pagination: payload.meta ?? {}, filters: payload.filters ?? {} }
  } catch (error) { throw normalizeError(error, 'Unable to load payments right now.') }
}

export const showAdminPayment = async (id) => {
  try { return unwrapPayment(await paymentsApi.getAdminPayment(id)) } catch (error) { throw normalizeError(error, 'Unable to load the selected payment.') }
}

export const createPayment = async (payload) => {
  try { return unwrapPayment(await paymentsApi.createAdminPayment(payload)) } catch (error) { throw normalizeError(error, 'Unable to create the payment.') }
}

export const updatePaymentStatus = async (id, status, paidAt) => {
  try { return unwrapPayment(await paymentsApi.updateAdminPaymentStatus(id, status, paidAt)) } catch (error) { throw normalizeError(error, 'Unable to update the payment status.') }
}

export const loadPaymentMembershipOptions = async () => {
  try {
    const firstPage = await listAdminMemberships({ page: 1, per_page: 25, status: 'all' })
    const lastPage = Math.max(1, Number(firstPage.pagination?.last_page ?? 1))
    const remainingPages = await Promise.all(Array.from({ length: lastPage - 1 }, (_, index) => listAdminMemberships({ page: index + 2, per_page: 25, status: 'all' })))
    return [firstPage.memberships, ...remainingPages.map((page) => page.memberships)].flat()
  } catch (error) { throw normalizeError(error, 'Unable to load Membership options.') }
}

export const getMembershipPaymentSummary = async (membership) => {
  try {
    const response = await listAdminPayments({ search: membership.membership_number, page: 1, per_page: 1 })
    const payment = response.payments[0]
    return payment ? {
      membership_price: payment.membership_price,
      paid_total: payment.paid_total,
      outstanding_balance: payment.outstanding_balance,
    } : {
      membership_price: Number(membership.price ?? 0),
      paid_total: 0,
      outstanding_balance: Number(membership.price ?? 0),
    }
  } catch (error) { throw normalizeError(error, 'Unable to load the Membership balance.') }
}

export const getPaymentErrorMessage = (error, fallback = 'Something went wrong.') => {
  const firstValidationError = Object.values(error?.errors ?? {}).flat()[0]
  return firstValidationError ?? error?.message ?? fallback
}

export const getPaymentValidationErrors = (error) => error?.errors ?? {}
