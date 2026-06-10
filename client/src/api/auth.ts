import axios from 'axios'

// Self-contained auth client (kept separate from the packages/bookings client
// so the auth feature is isolated and additive).
const api = axios.create({ baseURL: '/api/auth' })

export type UserRole = 'User' | 'Admin'

export interface AuthUser {
  id: number
  username: string
  email: string
  role: UserRole
  // Signed JWT attached as a Bearer token on subsequent API calls.
  token: string
}

export interface RegisterInput {
  username: string
  email: string
  password: string
}

export interface LoginInput {
  username: string
  password: string
}

export interface ForgotPasswordInput {
  username: string
  newPassword: string
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>('/register', input)
  return data
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>('/login', input)
  return data
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/forgot-password', input)
  return data
}

// Pull a human-readable message out of an axios error (the API returns plain
// strings for 4xx auth failures).
export function authErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data
    if (typeof data === 'string' && data) return data
    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message?: unknown }).message
      if (typeof m === 'string') return m
    }
  }
  return fallback
}
