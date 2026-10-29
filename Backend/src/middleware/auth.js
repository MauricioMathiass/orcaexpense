import { createRemoteJWKSet, jwtVerify } from 'jose'
import { config } from '../config.js'
import { AppError } from '../lib/errors.js'

// Criado uma vez: a biblioteca guarda as chaves em cache e só busca de novo quando necessário.
const jwks = createRemoteJWKSet(config.authJwksUrl)

// Exige "Authorization: Bearer <token do Neon Auth>" e deixa o id do usuário em `req.userId`.
export async function requireAuth(req, _res, next) {
  const header = req.get('authorization') || ''
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new AppError(401, 'unauthenticated', 'Faça login para continuar.')
  }

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: config.authIssuer })
    if (!payload.sub) throw new Error('token sem sub')
    req.userId = payload.sub
  } catch {
    throw new AppError(401, 'unauthenticated', 'Sessão expirada. Entre novamente.')
  }

  next()
}
