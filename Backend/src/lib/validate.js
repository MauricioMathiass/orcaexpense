import { z } from 'zod'
import { AppError } from './errors.js'

const roundMoney = (value) => Math.round(value * 100) / 100

// Valor em reais com até 2 casas, como o frontend envia (número, não texto).
export const money = z
  .number()
  .finite()
  .min(0)
  .max(9_999_999_999.99)
  .transform(roundMoney)

export function parse(schema, data) {
  const result = schema.safeParse(data ?? {})
  if (result.success) return result.data

  throw new AppError(
    400,
    'validation',
    'Dados inválidos.',
    result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
  )
}
