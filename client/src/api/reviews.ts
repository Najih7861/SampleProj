import { http } from './http'
import type { Review, ReviewInput, ReviewSummary } from '../types'

export async function getPackageReviews(packageId: number): Promise<Review[]> {
  const { data } = await http.get<Review[]>(`/packages/${packageId}/reviews`)
  return data
}

export async function getPackageReviewSummary(packageId: number): Promise<ReviewSummary> {
  const { data } = await http.get<ReviewSummary>(`/packages/${packageId}/reviews/summary`)
  return data
}

export async function createReview(input: ReviewInput): Promise<Review> {
  const { data } = await http.post<Review>('/reviews', input)
  return data
}
