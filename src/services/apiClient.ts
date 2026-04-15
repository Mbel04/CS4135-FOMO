import axios from 'axios'
import { store } from '../store'
import { clearAuth } from '../store/authSlice'

const baseURL = import.meta.env.VITE_API_BASE ?? ''

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fomo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // FormData must set multipart boundary automatically; default JSON Content-Type breaks uploads.
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(clearAuth())
      const path = window.location.pathname
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(err)
  },
)

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; fieldErrors?: Record<string, string> }
      | string
      | undefined
    if (typeof data === 'string') return data
    if (data && typeof data === 'object') {
      if ('message' in data && data.message) return String(data.message)
      const fe = data.fieldErrors
      if (fe && typeof fe === 'object') {
        const first = Object.values(fe).find(Boolean)
        if (first) return String(first)
      }
    }
    return err.message || 'Request failed'
  }
  return 'Something went wrong'
}
