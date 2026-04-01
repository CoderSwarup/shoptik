import axios from 'axios'
import { config } from '@/config'

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId')
  if (userId) {
    config.headers['x-user-id'] = userId
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userId')
      localStorage.removeItem('userRole')
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)
