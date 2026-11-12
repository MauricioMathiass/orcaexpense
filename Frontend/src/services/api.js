// Cliente da API (pasta Backend). Cada chamada leva o JWT do Neon Auth no cabeçalho.
//
//   fetchState()        -> Promise<{ revision, cards, expenses, receivables, customWidgets }>
//   saveState(snapshot) -> Promise<{ revision }>   (substitui os dados do usuário no banco)
//
// `snapshot.revision` é a versão que o cliente leu. Se outro dispositivo gravou antes,
// a API responde 409 (ApiError com code "conflict") e não altera nada.

import { getToken } from './auth'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
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
    throw new ApiError(
      response.status,
      payload?.error?.message || 'Erro ao falar com o servidor.',
      payload?.error?.code,
    )
  }

  return response.status === 204 ? undefined : response.json()
}

export const fetchState = () => request('/api/state')

export const saveState = (snapshot, options) =>
  request('/api/state', { method: 'PUT', body: snapshot, ...options })
