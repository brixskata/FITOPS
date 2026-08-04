import { createContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => authService.getStoredToken())
  const [loading, setLoading] = useState(true)

  const role = authService.getUserRole(user)
  const isAuthenticated = Boolean(token && user)

  useEffect(() => {
    let active = true

    const checkAuthentication = async () => {
      const storedToken = authService.getStoredToken()

      if (!storedToken) {
        if (active) setLoading(false)
        return
      }

      try {
        const authenticatedUser = await authService.getAuthenticatedUser()

        if (active) {
          setToken(storedToken)
          setUser(authenticatedUser.user ?? authenticatedUser)
        }
      } catch {
        authService.clearStoredToken()

        if (active) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    checkAuthentication()

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(() => ({
    user,
    role,
    token,
    loading,
    isAuthenticated,
    getRedirectPath: () => authService.getRoleRedirectPath(role),
    async login(credentials) {
      const result = await authService.login(credentials)
      const nextToken = authService.getTokenFromPayload(result)

      if (!nextToken) {
        throw new Error('Authentication token was not returned by the API.')
      }

      authService.storeToken(nextToken)
      setToken(nextToken)

      const authenticatedUser = await authService.getAuthenticatedUser()
      const nextUser = authenticatedUser.user ?? authenticatedUser

      setUser(nextUser)
      return nextUser
    },
    async register(payload) {
      const result = await authService.register(payload)
      const nextToken = authService.getTokenFromPayload(result)

      if (!nextToken) {
        throw new Error('Authentication token was not returned by the API.')
      }

      authService.storeToken(nextToken)
      setToken(nextToken)

      const authenticatedUser = await authService.getAuthenticatedUser()
      const nextUser = authenticatedUser.user ?? authenticatedUser

      setUser(nextUser)
      return nextUser
    },
    async logout() {
      try {
        if (authService.getStoredToken()) {
          await authService.logout()
        }
      } finally {
        authService.clearStoredToken()
        setToken(null)
        setUser(null)
      }
    },
  }), [isAuthenticated, loading, role, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
