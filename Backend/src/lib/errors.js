export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export const notFound = (what = 'Registro') => new AppError(404, 'not-found', `${what} não encontrado.`)
