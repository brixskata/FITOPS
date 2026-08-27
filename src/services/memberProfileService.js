import * as memberProfileApi from '../api/memberProfile'

const normalizeError = (error, fallbackMessage) => ({ status: error.response?.status ?? 0, message: error.response?.data?.message ?? error.message ?? fallbackMessage, errors: error.response?.data?.errors ?? {}, isNetworkError: !error.response })
export const getMemberProfile = async () => { try { const response = await memberProfileApi.getMemberProfile(); return response.data?.data ?? null } catch (error) { throw normalizeError(error, 'Unable to load your profile.') } }
export const saveMemberProfile = async (data) => { try { const response = await memberProfileApi.updateMemberProfile(data); return response.data?.data ?? null } catch (error) { throw normalizeError(error, 'Unable to update your profile.') } }
export const getMemberProfileErrorMessage = (error, fallback = 'Something went wrong.') => Object.values(error?.errors ?? {}).flat()[0] ?? error?.message ?? fallback
