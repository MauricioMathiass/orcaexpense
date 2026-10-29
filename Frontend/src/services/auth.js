// Autenticação pelo Neon Auth (Better Auth gerenciado). A interface (App e LoginPage) só conhece
// as funções abaixo; usuários, senhas, sessões e e-mails de redefinição ficam no Neon.
//
//   getSession()                              -> Promise<usuário | null>
//   signIn({ email, password, remember })     -> Promise<usuário>
//   signUp({ name, email, password })         -> Promise<usuário | null>  (null = falta confirmar o e-mail)
//   requestPasswordReset(email)               -> Promise<void>   (o Neon envia o e-mail com o link)
//   resetPassword({ token, password })        -> Promise<void>
//   getToken()                                -> Promise<string>  (JWT que a API valida)
//   signOut()                                 -> Promise<void>
//
// Usuário: { id, name, email }. Erros são `AuthError` com mensagem em português.

import { createInternalNeonAuth } from '@neondatabase/auth'

export const MIN_PASSWORD_LENGTH = 8

// O JWT do Neon Auth vale 15 minutos; reaproveita o mesmo até perto de vencer.
const TOKEN_REUSE_MS = 10 * 60 * 1000

export class AuthError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

const authUrl = import.meta.env.VITE_NEON_AUTH_URL
// `adapter` é o cliente do Better Auth (signIn, signUp...); `getJWTToken` é a forma oficial de obter o
// JWT da sessão (o Neon o entrega no cabeçalho "set-auth-jwt" do get-session).
const neonAuth = authUrl ? createInternalNeonAuth(authUrl) : null
const client = neonAuth?.adapter ?? null

let cachedToken = null

const toPublicUser = ({ id, name, email }) => ({ id, name, email })

const MESSAGES = {
  INVALID_EMAIL_OR_PASSWORD: 'E-mail ou senha incorretos.',
  INVALID_PASSWORD: 'E-mail ou senha incorretos.',
  USER_NOT_FOUND: 'E-mail ou senha incorretos.',
  USER_ALREADY_EXISTS: 'Já existe uma conta com este e-mail.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Já existe uma conta com este e-mail.',
  INVALID_EMAIL: 'Informe um e-mail válido.',
  PASSWORD_TOO_SHORT: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  PASSWORD_TOO_LONG: 'A senha é longa demais.',
  EMAIL_NOT_VERIFIED: 'Confirme o seu e-mail para entrar. Enviamos uma mensagem para você.',
  INVALID_TOKEN: 'Este link venceu ou já foi usado. Peça um novo.',
}

function toAuthError(error) {
  if (error?.status === 429) {
    return new AuthError('rate-limit', 'Muitas tentativas. Aguarde alguns minutos.')
  }
  const message = MESSAGES[error?.code]
  return new AuthError(error?.code || 'unknown', message || 'Não foi possível concluir. Tente novamente.')
}

// Executa uma chamada do Neon Auth e converte falhas (retornadas ou lançadas) em AuthError.
async function call(action) {
  if (!client) {
    throw new AuthError('config', 'O login não está configurado (falta VITE_NEON_AUTH_URL).')
  }

  let result
  try {
    result = await action(client)
  } catch (caught) {
    if (caught instanceof AuthError) throw caught
    throw new AuthError('network', 'Não foi possível conectar ao servidor. Verifique a internet.')
  }

  if (result?.error) throw toAuthError(result.error)
  return result?.data
}

export async function getSession() {
  try {
    const data = await call((auth) => auth.getSession())
    return data?.user ? toPublicUser(data.user) : null
  } catch {
    return null
  }
}

export async function signIn({ email, password, remember = false }) {
  const normalized = String(email || '').trim().toLowerCase()
  if (!normalized || !password) throw new AuthError('invalid-credentials', 'Informe o e-mail e a senha.')

  const data = await call((auth) =>
    auth.signIn.email({ email: normalized, password, rememberMe: remember }),
  )
  cachedToken = null
  return toPublicUser(data.user)
}

export async function signUp({ name, email, password }) {
  const cleanName = String(name || '').trim()
  const normalized = String(email || '').trim().toLowerCase()

  if (!cleanName) throw new AuthError('invalid-name', 'Informe o seu nome.')
  if (String(password || '').length < MIN_PASSWORD_LENGTH) {
    throw new AuthError('weak-password', MESSAGES.PASSWORD_TOO_SHORT)
  }

  const data = await call((auth) =>
    auth.signUp.email({ name: cleanName, email: normalized, password }),
  )
  cachedToken = null

  // Com "confirmar e-mail no cadastro" ligado no Neon, não há sessão até o usuário confirmar.
  const session = await getSession()
  return session ?? (data?.token ? toPublicUser(data.user) : null)
}

export async function requestPasswordReset(email) {
  const normalized = String(email || '').trim().toLowerCase()
  if (!normalized) throw new AuthError('invalid-email', MESSAGES.INVALID_EMAIL)

  // O link do e-mail volta para esta página com ?token=...
  await call((auth) =>
    auth.requestPasswordReset({ email: normalized, redirectTo: `${window.location.origin}/` }),
  )
}

export async function resetPassword({ token, password }) {
  if (String(password || '').length < MIN_PASSWORD_LENGTH) {
    throw new AuthError('weak-password', MESSAGES.PASSWORD_TOO_SHORT)
  }
  await call((auth) => auth.resetPassword({ newPassword: password, token }))
}

export async function getToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value

  if (!neonAuth) {
    throw new AuthError('config', 'O login não está configurado (falta VITE_NEON_AUTH_URL).')
  }

  let token = null
  try {
    token = await neonAuth.getJWTToken()
  } catch {
    throw new AuthError('network', 'Não foi possível conectar ao servidor. Verifique a internet.')
  }
  if (!token) throw new AuthError('unauthenticated', 'Sessão expirada. Entre novamente.')

  cachedToken = { value: token, expiresAt: Date.now() + TOKEN_REUSE_MS }
  return token
}

export async function signOut() {
  cachedToken = null
  try {
    await call((auth) => auth.signOut())
  } catch {
    // sem conexão, a sessão local some mesmo assim quando a página recarrega sem cookie válido
  }
}
