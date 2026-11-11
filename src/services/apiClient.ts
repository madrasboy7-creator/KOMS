/**
 * Shared API client for KOMS frontend.
 * Automatically proxies through Vite in development or same-origin in production.
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
  const url = `${API_BASE_URL}${path}`
  const token = localStorage.getItem('koms_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init?.headers as Record<string, string>) || {})
  }

  const response = await fetch(url, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({ error: response.statusText }))
    throw new ApiError(errBody.error || 'The request could not be completed.', response.status)
  }

  return response.json() as Promise<T>
}
