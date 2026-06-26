import { analyticsHttp } from './analyticsHttp'
import type { AnalyticsDashboard } from '../types/analytics'

// Fetches the full analytics payload from the Python microservice in one call.
// The Bearer JWT is attached automatically by analyticsHttp; the endpoint is
// Admin-only (the service returns 401 for an invalid/expired token, 403 for a
// valid non-admin token).
export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  const { data } = await analyticsHttp.get<AnalyticsDashboard>('/dashboard')
  return data
}
