import { roundMoney } from './money'

// Um item de Valores de Terceiros é uma pessoa com uma ou mais compras:
// { id, name, purchases: [{ id, label, amount, installment, installments, paidInstallments, received }] }
// `amount` e `received` do item são derivados das compras (total e "tudo recebido").

export function isInstallmentPurchase(purchase) {
  return !!purchase.installment && purchase.installments > 0
}

// Compras antigas não têm paidInstallments: deduz pelo status de recebimento.
export function getPaidInstallments(purchase) {
  if (!isInstallmentPurchase(purchase)) return 0
  const paid = purchase.paidInstallments ?? (purchase.received ? purchase.installments : 0)
  return Math.min(Math.max(paid, 0), purchase.installments)
}

// Valor já recebido: parcelas pagas (proporcional) ou o total quando à vista é recebida.
export function getReceivedAmount(purchase) {
  const amount = purchase.amount || 0
  if (!isInstallmentPurchase(purchase)) return purchase.received ? amount : 0
  const paid = getPaidInstallments(purchase)
  if (paid === purchase.installments) return amount
  return roundMoney((amount * paid) / purchase.installments)
}

export function normalizePurchase(purchase) {
  const amount = purchase.amount || 0
  const label = purchase.label || ''

  if (!isInstallmentPurchase(purchase)) {
    return { id: purchase.id, label, amount, installment: false, received: !!purchase.received }
  }

  const paidInstallments = getPaidInstallments(purchase)
  return {
    id: purchase.id,
    label,
    amount,
    installment: true,
    installments: purchase.installments,
    paidInstallments,
    received: paidInstallments === purchase.installments,
  }
}

// Idempotente: converte itens antigos (uma compra nos campos do próprio item)
// e recalcula os campos derivados.
export function normalizeReceivable(item) {
  const rawPurchases = item.purchases ?? [
    {
      id: `${item.id}-1`,
      amount: item.amount,
      installment: item.installment,
      installments: item.installments,
      paidInstallments: item.paidInstallments,
      received: item.received,
    },
  ]
  const purchases = rawPurchases.map(normalizePurchase)

  return {
    id: item.id,
    name: item.name,
    purchases,
    amount: roundMoney(purchases.reduce((total, purchase) => total + purchase.amount, 0)),
    received: purchases.length > 0 && purchases.every((purchase) => purchase.received),
  }
}

export function normalizeReceivables(list) {
  return list.map(normalizeReceivable)
}

export function getReceivableReceivedAmount(item) {
  return roundMoney(item.purchases.reduce((total, purchase) => total + getReceivedAmount(purchase), 0))
}

// Compras ainda em aberto: parceladas com parcelas a pagar ou à vista não recebidas.
export function getActivePurchases(item) {
  return item.purchases.filter((purchase) =>
    isInstallmentPurchase(purchase)
      ? getPaidInstallments(purchase) < purchase.installments
      : !purchase.received,
  )
}

// Valor da compra que aparece no resumo: a parcela individual ou o valor à vista.
export function getPurchaseUnitValue(purchase) {
  return isInstallmentPurchase(purchase)
    ? roundMoney(purchase.amount / purchase.installments)
    : purchase.amount
}

// Total parcial do mini card: soma do valor de cada compra ativa.
export function getReceivablePartialTotal(item) {
  return roundMoney(
    getActivePurchases(item).reduce((sum, purchase) => sum + getPurchaseUnitValue(purchase), 0),
  )
}
