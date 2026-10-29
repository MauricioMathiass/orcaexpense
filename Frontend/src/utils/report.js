import { formatCurrency } from './formatCurrency'
import { roundMoney } from './money'
import {
  getPaidInstallments,
  getPurchaseUnitValue,
  getReceivablePartialTotal,
  getReceivableReceivedAmount,
  getReceivedAmount,
  isInstallmentPurchase,
} from './receivables'

const sumBy = (items, pick) => roundMoney(items.reduce((sum, item) => sum + (pick(item) || 0), 0))

export function formatReportValue(type, value) {
  if (value === null || value === undefined || value === '') return ''
  if (type === 'currency') return formatCurrency(value)
  if (type === 'percent') return `${value}%`
  return String(value)
}

export function buildReport({ cards, expenses, receivables }) {
  const bills = expenses.filter((expense) => expense.cardId)
  const fixedExpenses = expenses.filter((expense) => !expense.cardId)
  const pending = (items) => items.filter((item) => !item.paid)
  const status = (paid, doneLabel) => (paid ? doneLabel : 'Pendente')

  const purchases = cards.flatMap((card) =>
    (card.checklist || [])
      .filter((item) => item.installment && item.installments > 0)
      .map((item) => ({
        name: item.name,
        card: card.brand,
        installments: item.installments,
        paidInstallments: item.paidInstallments || 0,
        total: item.amount || 0,
        monthly: roundMoney((item.amount || 0) / item.installments),
      })),
  )

  const limitTotal = sumBy(cards, (card) => card.limit)
  const spentTotal = sumBy(cards, (card) => card.spent)
  const billsPending = sumBy(pending(bills), (bill) => bill.amount)
  const fixedPending = sumBy(pending(fixedExpenses), (expense) => expense.amount)
  const receivablesTotal = sumBy(receivables, (item) => item.amount)
  const receivablesReceived = sumBy(receivables, getReceivableReceivedAmount)
  const receivablesPending = roundMoney(receivablesTotal - receivablesReceived)

  // Mesmo resumo do mini card: uma linha por compra e, ao fim de cada pessoa, o total parcial.
  const receivableRows = receivables.flatMap((item) => [
    ...item.purchases.map((purchase, index) => {
      const installment = isInstallmentPurchase(purchase)
      const paidCount = getPaidInstallments(purchase)

      return {
        name: item.name,
        purchase: purchase.label || `Compra ${index + 1}`,
        active: installment ? purchase.installments : '',
        paid: installment ? paidCount : '',
        left: installment ? purchase.installments - paidCount : '',
        unit: installment ? getPurchaseUnitValue(purchase) : '',
        total: purchase.amount,
        pending: roundMoney(purchase.amount - getReceivedAmount(purchase)),
        status: status(purchase.received, 'Recebido'),
      }
    }),
    {
      name: item.name,
      purchase: 'Total parcial',
      partial: getReceivablePartialTotal(item),
      subtotal: true,
    },
  ])
  const percentOf = (part, whole) => {
    if (whole > 0) return Math.round((part / whole) * 100)
    return part > 0 ? 100 : 0
  }

  const summary = [
    { label: 'Cartões cadastrados', type: 'number', value: cards.length },
    { label: 'Limite total dos cartões', type: 'currency', value: limitTotal },
    { label: 'Gasto atual nos cartões', type: 'currency', value: spentTotal },
    { label: 'Limite disponível', type: 'currency', value: roundMoney(limitTotal - spentTotal) },
    { label: 'Faturas pendentes', type: 'currency', value: billsPending },
    { label: 'Despesas fixas mensais pendentes', type: 'currency', value: fixedPending },
    {
      label: 'Total a pagar (faturas + despesas)',
      type: 'currency',
      value: roundMoney(billsPending + fixedPending),
    },
    {
      label: 'Compras parceladas (total)',
      type: 'currency',
      value: sumBy(purchases, (purchase) => purchase.total),
    },
    {
      label: 'Parcelas mensais (soma)',
      type: 'currency',
      value: sumBy(purchases, (purchase) => purchase.monthly),
    },
    { label: 'Valores a receber de terceiros', type: 'currency', value: receivablesPending },
    { label: 'Valores já recebidos', type: 'currency', value: receivablesReceived },
  ]

  const tables = [
    {
      id: 'cards',
      title: 'Cartões',
      sheet: 'Cartões',
      columns: [
        { key: 'name', label: 'Cartão', type: 'text' },
        { key: 'network', label: 'Bandeira', type: 'text' },
        { key: 'limit', label: 'Limite', type: 'currency' },
        { key: 'spent', label: 'Gasto', type: 'currency' },
        { key: 'available', label: 'Disponível', type: 'currency' },
        { key: 'usage', label: 'Uso', type: 'percent' },
      ],
      rows: cards.map((card) => ({
        name: card.brand,
        network: card.network,
        limit: card.limit,
        spent: card.spent,
        available: roundMoney(card.limit - card.spent),
        usage: percentOf(card.spent, card.limit),
      })),
      totals: {
        name: 'Total',
        limit: limitTotal,
        spent: spentTotal,
        available: roundMoney(limitTotal - spentTotal),
        usage: percentOf(spentTotal, limitTotal),
      },
    },
    {
      id: 'bills',
      title: 'Faturas dos Cartões',
      sheet: 'Faturas',
      columns: [
        { key: 'name', label: 'Fatura', type: 'text' },
        { key: 'amount', label: 'Valor', type: 'currency' },
        { key: 'status', label: 'Status', type: 'text' },
      ],
      rows: bills.map((bill) => ({
        name: bill.name,
        amount: bill.amount || 0,
        status: status(bill.paid, 'Pago'),
      })),
      totals: { name: 'Total', amount: sumBy(bills, (bill) => bill.amount) },
    },
    {
      id: 'fixed',
      title: 'Despesas Fixas Mensais',
      sheet: 'Despesas Fixas',
      columns: [
        { key: 'name', label: 'Despesa', type: 'text' },
        { key: 'amount', label: 'Valor', type: 'currency' },
        { key: 'status', label: 'Status', type: 'text' },
      ],
      rows: fixedExpenses.map((expense) => ({
        name: expense.name,
        amount: expense.amount || 0,
        status: status(expense.paid, 'Pago'),
      })),
      totals: { name: 'Total', amount: sumBy(fixedExpenses, (expense) => expense.amount) },
    },
    {
      id: 'purchases',
      title: 'Compras Parceladas',
      sheet: 'Compras Parceladas',
      columns: [
        { key: 'name', label: 'Compra', type: 'text' },
        { key: 'card', label: 'Cartão', type: 'text' },
        { key: 'installments', label: 'Parcelas', type: 'text' },
        { key: 'paid', label: 'Pagas', type: 'text' },
        { key: 'monthly', label: 'Valor da parcela', type: 'currency' },
        { key: 'total', label: 'Total', type: 'currency' },
      ],
      rows: purchases.map((purchase) => ({
        name: purchase.name,
        card: purchase.card,
        installments: `${purchase.installments}x`,
        paid: `${purchase.paidInstallments}/${purchase.installments}`,
        monthly: purchase.monthly,
        total: purchase.total,
      })),
      totals: {
        name: 'Total',
        monthly: sumBy(purchases, (purchase) => purchase.monthly),
        total: sumBy(purchases, (purchase) => purchase.total),
      },
    },
    {
      id: 'receivables',
      title: 'Valores a serem Cobrados',
      sheet: 'Valores de Terceiros',
      compact: true,
      columns: [
        { key: 'name', label: 'Nome', type: 'text' },
        { key: 'purchase', label: 'Compra', type: 'text' },
        { key: 'active', label: 'Parcelas ativas', type: 'number' },
        { key: 'paid', label: 'Pagas', type: 'number' },
        { key: 'left', label: 'Faltantes', type: 'number' },
        { key: 'unit', label: 'Valor da parcela', type: 'currency' },
        { key: 'total', label: 'Total da compra', type: 'currency' },
        { key: 'pending', label: 'A receber', type: 'currency' },
        { key: 'partial', label: 'Total parcial', type: 'currency' },
        { key: 'status', label: 'Status', type: 'text' },
      ],
      rows: receivableRows,
      totals: {
        name: 'Total',
        total: receivablesTotal,
        pending: receivablesPending,
        partial: sumBy(receivables, getReceivablePartialTotal),
      },
    },
  ]

  return { summary, tables }
}
