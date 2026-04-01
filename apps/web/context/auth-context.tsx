'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService, type User } from '@/services/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setLoading(false)
      return
    }
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email: string, password: string) => {
    const loggedInUser = await authService.login({ email, password })
    localStorage.setItem('userId', loggedInUser.id)
    localStorage.setItem('userRole', loggedInUser.role)
    setUser(loggedInUser)
  }

  const register = async (name: string, email: string, password: string) => {
    const newUser = await authService.register({ name, email, password })
    localStorage.setItem('userId', newUser.id)
    localStorage.setItem('userRole', newUser.role)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    setUser(null)
    window.location.href = '/signin'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
