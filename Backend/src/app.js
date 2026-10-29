import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { config } from './config.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'
import { stateRouter } from './routes/state.js'

export function createApp() {
  const app = express()

  // Atrás de proxy (Render, Railway etc.) o IP real vem no cabeçalho; o limitador precisa dele.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(helmet())
  app.use(
    cors({
      origin(origin, callback) {
        // Sem "Origin" (curl, health check) não é navegador: libera.
        callback(null, !origin || config.corsOrigins.includes(origin))
      },
    }),
  )
  // O retrato completo dos dados de um usuário cabe com folga em 1 MB.
  app.use(express.json({ limit: '1mb' }))

  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  // O login em si é do Neon Auth; aqui só limitamos o volume de chamadas por IP.
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 1000,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: { code: 'rate-limit', message: 'Muitas requisições. Aguarde alguns minutos.' } },
    }),
  )
  app.use('/api/state', stateRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
