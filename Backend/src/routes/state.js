import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { AppError } from '../lib/errors.js'
import { scopeId } from '../lib/ids.js'
import { toCard, toExpense, toReceivable, toWidget } from '../lib/serializers.js'
import { money, parse } from '../lib/validate.js'
import { requireAuth } from '../middleware/auth.js'

export const stateRouter = Router()
stateRouter.use(requireAuth)

const byPosition = { orderBy: { position: 'asc' } }

const id = z.string().min(1).max(100)
const installments = z.number().int().min(2).max(99).nullish()

const checklistItemSchema = z.object({
  id,
  name: z.string().trim().min(1).max(120),
  amount: money.default(0),
  installment: z.boolean().default(false),
  installments,
  settled: z.boolean().default(false),
})

const cardSchema = z.object({
  id,
  brand: z.string().trim().min(1).max(60),
  network: z.string().trim().min(1).max(40),
  holder: z.string().trim().min(1).max(80),
  lastDigits: z.string().regex(/^\d{4}$/),
  bgClass: z.string().trim().min(1).max(40).default('card-dark'),
  limit: money.default(0),
  spent: money.default(0),
  checklist: z.array(checklistItemSchema).max(500).default([]),
})

const expenseSchema = z.object({
  id,
  name: z.string().trim().min(1).max(120),
  amount: money.default(0),
  paid: z.boolean().default(false),
  cardId: id.nullish(),
})

const purchaseSchema = z.object({
  id,
  label: z.string().trim().max(120).default(''),
  amount: money.default(0),
  installment: z.boolean().default(false),
  installments,
  paidInstallments: z.number().int().min(0).max(99).default(0),
  received: z.boolean().default(false),
})

const receivableSchema = z.object({
  id,
  name: z.string().trim().min(1).max(120),
  purchases: z.array(purchaseSchema).max(200).default([]),
})

const widgetSchema = z.object({
  id,
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).default(''),
})

const snapshotSchema = z.object({
  cards: z.array(cardSchema).max(100).default([]),
  expenses: z.array(expenseSchema).max(1000).default([]),
  receivables: z.array(receivableSchema).max(500).default([]),
  customWidgets: z.array(widgetSchema).max(100).default([]),
})

function assertUniqueIds(label, ids) {
  if (new Set(ids).size !== ids.length) {
    throw new AppError(400, 'validation', `Há ${label} com o mesmo id.`)
  }
}

// Tudo do usuário de uma vez, no mesmo formato que o frontend usa nos seus estados.
stateRouter.get('/', async (req, res) => {
  const where = { userId: req.userId }

  const [cards, expenses, receivables, widgets] = await Promise.all([
    prisma.card.findMany({ where, include: { checklist: byPosition }, ...byPosition }),
    prisma.expense.findMany({ where, ...byPosition }),
    prisma.receivable.findMany({ where, include: { purchases: byPosition }, ...byPosition }),
    prisma.widget.findMany({ where, ...byPosition }),
  ])

  res.json({
    cards: cards.map(toCard),
    expenses: expenses.map(toExpense),
    receivables: receivables.map(toReceivable),
    customWidgets: widgets.map(toWidget),
  })
})

// Substitui os dados do usuário pelo retrato enviado, tudo numa transação: ou grava tudo, ou nada.
stateRouter.put('/', async (req, res) => {
  const snapshot = parse(snapshotSchema, req.body)
  const { userId } = req

  assertUniqueIds('cartões', snapshot.cards.map((card) => card.id))
  assertUniqueIds('compras de cartão', snapshot.cards.flatMap((card) => card.checklist.map((item) => item.id)))
  assertUniqueIds('despesas', snapshot.expenses.map((expense) => expense.id))
  assertUniqueIds('valores de terceiros', snapshot.receivables.map((item) => item.id))
  assertUniqueIds('compras de terceiros', snapshot.receivables.flatMap((item) => item.purchases.map((p) => p.id)))
  assertUniqueIds('blocos', snapshot.customWidgets.map((widget) => widget.id))

  const cardIds = new Set(snapshot.cards.map((card) => card.id))
  const scope = (value) => scopeId(userId, value)
  const where = { userId }

  await prisma.$transaction([
    // Apagar o cartão e o terceiro leva junto as compras deles (cascata no banco).
    prisma.expense.deleteMany({ where }),
    prisma.card.deleteMany({ where }),
    prisma.receivable.deleteMany({ where }),
    prisma.widget.deleteMany({ where }),

    prisma.card.createMany({
      data: snapshot.cards.map(({ checklist, ...card }, position) => ({
        ...card,
        id: scope(card.id),
        userId,
        position,
      })),
    }),
    prisma.checklistItem.createMany({
      data: snapshot.cards.flatMap((card) =>
        card.checklist.map(({ installments, ...item }, position) => ({
          ...item,
          id: scope(item.id),
          cardId: scope(card.id),
          installments: item.installment ? (installments ?? null) : null,
          position,
        })),
      ),
    }),
    prisma.expense.createMany({
      data: snapshot.expenses.map((expense, position) => ({
        ...expense,
        id: scope(expense.id),
        userId,
        // Fatura de um cartão que não existe mais vira despesa comum.
        cardId: expense.cardId && cardIds.has(expense.cardId) ? scope(expense.cardId) : null,
        position,
      })),
    }),
    prisma.receivable.createMany({
      data: snapshot.receivables.map(({ purchases, ...item }, position) => ({
        ...item,
        id: scope(item.id),
        userId,
        position,
      })),
    }),
    prisma.purchase.createMany({
      data: snapshot.receivables.flatMap((item) =>
        item.purchases.map(({ installments, ...purchase }, position) => ({
          ...purchase,
          id: scope(purchase.id),
          receivableId: scope(item.id),
          installments: purchase.installment ? (installments ?? null) : null,
          position,
        })),
      ),
    }),
    prisma.widget.createMany({
      data: snapshot.customWidgets.map((widget, position) => ({
        ...widget,
        id: scope(widget.id),
        userId,
        position,
      })),
    }),
  ])

  res.status(204).end()
})

// "Zerar conteúdo": apaga os dados do usuário. A conta (no Neon Auth) permanece.
stateRouter.delete('/', async (req, res) => {
  const where = { userId: req.userId }

  await prisma.$transaction([
    prisma.expense.deleteMany({ where }),
    prisma.card.deleteMany({ where }),
    prisma.receivable.deleteMany({ where }),
    prisma.widget.deleteMany({ where }),
  ])
  res.status(204).end()
})
