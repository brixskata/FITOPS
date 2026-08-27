import * as memberPaymentsApi from '../api/memberPayments'

const normalizeError = (error, fallbackMessage) => ({ status: error.response?.status ?? 0, message: error.response?.data?.message ?? error.message ?? fallbackMessage, errors: error.response?.data?.errors ?? {}, isNetworkError: !error.response })
export const listMemberPayments = async (params = {}) => { try { const response = await memberPaymentsApi.getMemberPayments(params); const payload = response.data?.data ?? {}; return { payments: Array.isArray(payload.data) ? payload.data : [], pagination: payload.meta ?? {}, filters: payload.filters ?? {} } } catch (error) { throw normalizeError(error, 'Unable to load your payment history.') } }
export const showMemberPayment = async (id) => { try { const response = await memberPaymentsApi.getMemberPayment(id); return response.data?.data ?? null } catch (error) { throw normalizeError(error, 'Unable to load this payment record.') } }
export const getMemberPaymentErrorMessage = (error, fallback = 'Something went wrong.') => Object.values(error?.errors ?? {}).flat()[0] ?? error?.message ?? fallback
