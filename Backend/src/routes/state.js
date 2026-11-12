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
  // Versão que o cliente leu; 0 = conta que ainda não gravou nada.
  revision: z.number().int().min(0),
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

  // Uma transação só, para a versão e os dados virem do mesmo instante.
  const [state, cards, expenses, receivables, widgets] = await prisma.$transaction(
    [
      prisma.userState.findUnique({ where: { userId: req.userId } }),
      prisma.card.findMany({ where, include: { checklist: byPosition }, ...byPosition }),
      prisma.expense.findMany({ where, ...byPosition }),
      prisma.receivable.findMany({ where, include: { purchases: byPosition }, ...byPosition }),
      prisma.widget.findMany({ where, ...byPosition }),
    ],
    { isolationLevel: 'RepeatableRead' },
  )

  res.json({
    revision: state?.revision ?? 0,
    cards: cards.map(toCard),
    expenses: expenses.map(toExpense),
    receivables: receivables.map(toReceivable),
    customWidgets: widgets.map(toWidget),
  })
})

const conflict = () =>
  new AppError(
    409,
    'conflict',
    'Seus dados foram alterados em outro dispositivo. Recarregue a página para ver a versão mais recente.',
  )

// Substitui os dados do usuário pelo retrato enviado, tudo numa transação: ou grava tudo, ou nada.
// Só vale se `revision` for a versão atual; senão devolve 409 e não altera nada (quem salvou antes vence).
stateRouter.put('/', async (req, res) => {
  const { revision, ...snapshot } = parse(snapshotSchema, req.body)
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

  const nextRevision = await prisma.$transaction(
    async (tx) => {
      // O UPDATE trava a linha do usuário: duas gravações ao mesmo tempo ficam em fila,
      // e a segunda não encontra mais a versão que leu (count 0 = conflito).
      if (revision === 0) {
        try {
          await tx.userState.create({ data: { userId, revision: 1 } })
        } catch (error) {
          if (error?.code === 'P2002') throw conflict()
          throw error
        }
      } else {
        const { count } = await tx.userState.updateMany({
          where: { userId, revision },
          data: { revision: { increment: 1 } },
        })
        if (count === 0) throw conflict()
      }

      // Apagar o cartão e o terceiro leva junto as compras deles (cascata no banco).
      await tx.expense.deleteMany({ where })
      await tx.card.deleteMany({ where })
      await tx.receivable.deleteMany({ where })
      await tx.widget.deleteMany({ where })

      await tx.card.createMany({
        data: snapshot.cards.map(({ checklist, ...card }, position) => ({
          ...card,
          id: scope(card.id),
          userId,
          position,
        })),
      })
      await tx.checklistItem.createMany({
        data: snapshot.cards.flatMap((card) =>
          card.checklist.map(({ installments, ...item }, position) => ({
            ...item,
            id: scope(item.id),
            cardId: scope(card.id),
            installments: item.installment ? (installments ?? null) : null,
            position,
          })),
        ),
      })
      await tx.expense.createMany({
        data: snapshot.expenses.map((expense, position) => ({
          ...expense,
          id: scope(expense.id),
          userId,
          // Fatura de um cartão que não existe mais vira despesa comum.
          cardId: expense.cardId && cardIds.has(expense.cardId) ? scope(expense.cardId) : null,
          position,
        })),
      })
      await tx.receivable.createMany({
        data: snapshot.receivables.map(({ purchases, ...item }, position) => ({
          ...item,
          id: scope(item.id),
          userId,
          position,
        })),
      })
      await tx.purchase.createMany({
        data: snapshot.receivables.flatMap((item) =>
          item.purchases.map(({ installments, ...purchase }, position) => ({
            ...purchase,
            id: scope(purchase.id),
            receivableId: scope(item.id),
            installments: purchase.installment ? (installments ?? null) : null,
            position,
          })),
        ),
      })
      await tx.widget.createMany({
        data: snapshot.customWidgets.map((widget, position) => ({
          ...widget,
          id: scope(widget.id),
          userId,
          position,
        })),
      })

      return revision + 1
    },
    // Margem para o banco de São Paulo ao gravar muitas linhas de uma vez.
    { maxWait: 10_000, timeout: 20_000 },
  )

  res.json({ revision: nextRevision })
})

// "Zerar conteúdo": apaga os dados do usuário. A conta (no Neon Auth) permanece.
stateRouter.delete('/', async (req, res) => {
  const { userId } = req
  const where = { userId }

  // Avança a versão: telas abertas com os dados antigos recebem conflito em vez de recriá-los.
  const state = await prisma.$transaction([
    prisma.userState.upsert({
      where: { userId },
      create: { userId, revision: 1 },
      update: { revision: { increment: 1 } },
    }),
    prisma.expense.deleteMany({ where }),
    prisma.card.deleteMany({ where }),
    prisma.receivable.deleteMany({ where }),
    prisma.widget.deleteMany({ where }),
  ])
  res.json({ revision: state[0].revision })
})
