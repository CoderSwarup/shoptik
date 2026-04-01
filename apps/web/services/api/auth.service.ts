import { apiClient } from '@/lib/api-client'

export interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string | null
  updatedAt: string | null
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export const authService = {
  async register(input: RegisterInput): Promise<User> {
    const { data } = await apiClient.post<User>('/auth/register', input)
    return data
  },

  async login(input: LoginInput): Promise<User> {
    const { data } = await apiClient.post<User>('/auth/login', input)
    return data
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await apiClient.get<User>('/auth/me')
      return data
    } catch {
      return null
    }
  },

  logout() {
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    window.location.href = '/signin'
  },
}
