import axios from 'axios'

// Self-contained client for the forgot-password OTP feature, kept separate from
// api/auth.ts so the feature is isolated and additive. Talks to the new
// /api/password-reset endpoints (proxied to the API in dev).
const api = axios.create({ baseURL: '/api/password-reset' })

export interface OtpSentResult {
  // Masked email the code was sent to, e.g. "na***@gmail.com".
  email: string
  // How long the code stays valid, in seconds (300 = 5 minutes).
  expiresInSeconds: number
}

// Step 1 — request a code for a username; the API emails it to that account.
export async function requestOtp(username: string): Promise<OtpSentResult> {
  const { data } = await api.post<OtpSentResult>('/request', { username })
  return data
}

// Step 2 — submit the emailed code plus the new password.
export async function verifyOtp(input: {
  username: string
  otp: string
  newPassword: string
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/verify', input)
  return data
}
