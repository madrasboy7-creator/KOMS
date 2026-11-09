/**
 * Future shared API configuration for both KOMS panels.
 * Set VITE_KOMS_API_BASE_URL only to the HTTPS backend API—not directly to
 * Neon. Database credentials must remain server-side.
 */
export const API_BASE_URL = import.meta.env.VITE_KOMS_API_BASE_URL ?? ''

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new ApiError('KOMS API is not configured.', 503)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) throw new ApiError('The request could not be completed.', response.status)
  return response.json() as Promise<T>
}
