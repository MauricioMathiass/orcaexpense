// Converte os registros do Prisma (Decimal, null, ids com prefixo do usuário) no formato que o frontend usa.

import { unscopeId } from './ids.js'

const num = (value) => (value == null ? value : Number(value))

export const toChecklistItem = (item) => ({
  id: unscopeId(item.id),
  name: item.name,
  amount: num(item.amount),
  installment: item.installment,
  installments: item.installments ?? undefined,
  settled: item.settled,
})

export const toCard = (card) => ({
  id: unscopeId(card.id),
  brand: card.brand,
  network: card.network,
  holder: card.holder,
  lastDigits: card.lastDigits,
  bgClass: card.bgClass,
  limit: num(card.limit),
  spent: num(card.spent),
  checklist: (card.checklist ?? []).map(toChecklistItem),
})

export const toExpense = (expense) => ({
  id: unscopeId(expense.id),
  name: expense.name,
  amount: num(expense.amount),
  paid: expense.paid,
  cardId: expense.cardId ? unscopeId(expense.cardId) : undefined,
})

export const toPurchase = (purchase) => ({
  id: unscopeId(purchase.id),
  label: purchase.label,
  amount: num(purchase.amount),
  installment: purchase.installment,
  installments: purchase.installments ?? undefined,
  paidInstallments: purchase.paidInstallments,
  received: purchase.received,
})

export const toReceivable = (receivable) => ({
  id: unscopeId(receivable.id),
  name: receivable.name,
  purchases: (receivable.purchases ?? []).map(toPurchase),
})

export const toWidget = ({ id, title, description }) => ({ id: unscopeId(id), title, description })
