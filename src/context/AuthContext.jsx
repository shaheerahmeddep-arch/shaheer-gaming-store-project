import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, logoutUser, getMe } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const res = await getMe()
          setUser(res.data)
          localStorage.setItem('user', JSON.stringify(res.data))
        } catch (err) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    bootstrap()
  }, [])

  const login = async (credentials) => {
    const res = await loginUser(credentials)
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (data) => {
    const res = await registerUser(data)
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token')
    try {
      await logoutUser(refresh)
    } catch (err) {
      // ignore network errors on logout
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await getMe()
    setUser(res.data)
    localStorage.setItem('user', JSON.stringify(res.data))
    return res.data
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_staff,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
