import { http } from './http'
import type { Place, PlaceInput } from '../types'

// ---- Places ----
export async function getPlaces(): Promise<Place[]> {
  const { data } = await http.get<Place[]>('/places')
  return data
}

export async function getPlace(id: number): Promise<Place> {
  const { data } = await http.get<Place>(`/places/${id}`)
  return data
}

export async function createPlace(input: PlaceInput): Promise<Place> {
  const { data } = await http.post<Place>('/places', input)
  return data
}

export async function updatePlace(id: number, input: PlaceInput): Promise<void> {
  await http.put(`/places/${id}`, input)
}

export async function deletePlace(id: number): Promise<void> {
  await http.delete(`/places/${id}`)
}
