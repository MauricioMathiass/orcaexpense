import { config } from '../config.js'
import { AppError } from '../lib/errors.js'

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: { code: 'not-found', message: 'Rota não encontrada.' } })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details },
    })
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'bad-json', message: 'JSON inválido.' } })
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'too-large', message: 'Requisição grande demais.' } })
  }

  console.error(error)
  res.status(500).json({
    error: {
      code: 'internal',
      message: 'Erro interno. Tente novamente em instantes.',
      ...(config.isProduction ? {} : { debug: String(error?.message || error) }),
    },
  })
}
