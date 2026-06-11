import { http } from './http'
import type { RatingSummary, Review, ReviewInput } from '../types'

// Reviews & ratings for a tour package. Separate module (additive) so the
// existing client.ts is untouched.
export async function getPackageReviews(packageId: number): Promise<Review[]> {
  const { data } = await http.get<Review[]>(`/packages/${packageId}/reviews`)
  return data
}

export async function getPackageRatingSummary(packageId: number): Promise<RatingSummary> {
  const { data } = await http.get<RatingSummary>(`/packages/${packageId}/reviews/summary`)
  return data
}

export async function createReview(input: ReviewInput): Promise<Review> {
  const { data } = await http.post<Review>('/reviews', input)
  return data
}

export async function deleteReview(id: number): Promise<void> {
  await http.delete(`/reviews/${id}`)
}
