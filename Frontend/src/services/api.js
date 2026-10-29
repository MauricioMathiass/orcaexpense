// Cliente da API (pasta Backend). Cada chamada leva o JWT do Neon Auth no cabeçalho.
//
//   fetchState()        -> Promise<{ cards, expenses, receivables, customWidgets }>
//   saveState(snapshot) -> Promise<void>   (substitui os dados do usuário no banco)

import { getToken } from './auth'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, { method = 'GET', body, keepalive = false } = {}) {
  const token = await getToken()

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      keepalive,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor.')
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new ApiError(response.status, payload?.error?.message || 'Erro ao falar com o servidor.')
  }

  return response.status === 204 ? undefined : response.json()
}

export const fetchState = () => request('/api/state')

export const saveState = (snapshot, options) =>
  request('/api/state', { method: 'PUT', body: snapshot, ...options })
