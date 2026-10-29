import { PrismaClient } from '@prisma/client'
import { config } from './config.js'

// A conexão com pool do Neon (host "-pooler") passa pelo PgBouncer em modo transação,
// que não aceita prepared statements: o Prisma precisa de `pgbouncer=true` nesse caso.
function withPgBouncer(url) {
  const parsed = new URL(url)
  if (parsed.hostname.includes('-pooler') && !parsed.searchParams.has('pgbouncer')) {
    parsed.searchParams.set('pgbouncer', 'true')
  }
  return parsed.toString()
}

export const prisma = new PrismaClient({ datasourceUrl: withPgBouncer(config.databaseUrl) })
