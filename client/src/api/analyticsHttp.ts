import axios from 'axios'
import { STORAGE_KEY, getStoredToken } from './http'

// Dedicated axios client for the Python analytics microservice. It shares the
// same stored JWT as the main `http` client (attached as a Bearer token) but
// points at a different baseURL: the Vite dev proxy forwards `/analytics/*` to
// the FastAPI service on :8000 (see vite.config.ts).
//
// The 401 handling mirrors `http` exactly, so an expired/invalid token coming
// back from the Python service clears auth and bounces the user to /auth just
// like a 401 from the .NET API does.
export const analyticsHttp = axios.create({ baseURL: '/analytics' })

analyticsHttp.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

analyticsHttp.interceptors.response.use(
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
