import axios from 'axios'

// Shared API client. A request interceptor attaches the stored JWT as a Bearer
// token; a response interceptor clears auth and bounces to /auth on 401 so an
// expired/invalid session lands the user back on the login screen.
//
// Auth state is persisted by AuthContext under this localStorage key as the
// AuthUser object (which carries the token).
const STORAGE_KEY = 'wanderlust.auth.user'

export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { token?: string }
    return parsed.token ?? null
  } catch {
    return null
  }
}

export const http = axios.create({ baseURL: '/api' })

http.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEY)
      if (window.location.pathname !== '/auth') {
        window.location.assign('/auth')
      }
    }
    return Promise.reject(error)
  },
)
