import { http } from './http'
import type { AdminStats } from '../types'

// Admin dashboard counts in a single call. The shared `http` client attaches the
// Bearer JWT automatically, so the admin token flows through; the endpoint is
// gated with [Authorize(Roles = "Admin")] server-side.
export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await http.get<AdminStats>('/admin/stats')
  return data
}
