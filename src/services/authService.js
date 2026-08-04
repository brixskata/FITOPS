import api from '../api/axios'

const TOKEN_KEY = 'fitops_token'

const unwrapPayload = (response) => response.data?.data ?? response.data

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)

export const storeToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const register = async (payload) => {
  const response = await api.post('/register', payload)
  return unwrapPayload(response)
}

export const login = async (credentials) => {
  const response = await api.post('/login', credentials)
  return unwrapPayload(response)
}

export const getAuthenticatedUser = async () => {
  const response = await api.get('/user')
  return unwrapPayload(response)
}

export const logout = async () => {
  const response = await api.post('/logout')
  return unwrapPayload(response)
}

export const getTokenFromPayload = (payload) => (
  payload?.token ?? payload?.access_token ?? payload?.plainTextToken
)

export const getUserRole = (user) => {
  const rawRole = user?.role ?? user?.roles?.[0]?.name ?? user?.roles?.[0]
  return typeof rawRole === 'string' ? rawRole.toLowerCase() : null
}

export const getRoleRedirectPath = (role) => {
  const normalizedRole = role?.toLowerCase()

  if (normalizedRole === 'trainer') return '/trainer/dashboard'
  if (normalizedRole === 'member') return '/member/dashboard'

  return '/admin/dashboard'
}

export const getValidationErrors = (error) => error.response?.data?.errors ?? {}

export const getAuthErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => (
  error.response?.data?.message ?? error.message ?? fallback
)
