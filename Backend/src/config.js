import dotenv from 'dotenv'

// O `neon deploy` (rodado nesta pasta) grava as variáveis do Neon em .env.local;
// um .env pode complementar (ex.: PORT, CORS_ORIGIN). Variáveis já definidas no ambiente vencem.
dotenv.config({
  path: [new URL('../.env.local', import.meta.url), new URL('../.env', import.meta.url)],
  quiet: true,
})

const required = (name) => {
  const value = process.env[name]
  if (!value) {
    console.error(`Variável de ambiente ausente: ${name}. Rode "neon deploy" nesta pasta (veja o README).`)
    process.exit(1)
  }
  return value
}

const authBaseUrl = required('NEON_AUTH_BASE_URL')

export const config = {
  port: Number(process.env.PORT) || 3001,
  databaseUrl: required('DATABASE_URL'),
  // O Neon Auth assina os tokens com EdDSA; a chave pública vem do JWKS e o emissor é a origem da URL do Auth.
  authJwksUrl: new URL(required('NEON_AUTH_JWKS_URL')),
  authIssuer: new URL(authBaseUrl).origin,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    // Tolera a barra no final ("https://site.netlify.app/"): o navegador envia a origem sem ela.
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  isProduction: process.env.NODE_ENV === 'production',
}
