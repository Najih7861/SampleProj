import { http } from './http'

// Uploads a single image to the backend (admin only) and returns its relative
// URL (e.g. "/uploads/{guid}.jpg"). Used for package covers and place galleries.
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post<{ url: string }>('/uploads', form)
  return data.url
}
