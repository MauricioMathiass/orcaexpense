import { CardTinyIcon, MinusIcon, PlusIcon } from './icons'
import { formatCurrency } from '../utils/formatCurrency'
import './InstallmentsSummary.css'

export function InstallmentsSummary({ cards, onAdjustPaid }) {
  const purchases = cards
    .flatMap((card) =>
      (card.checklist || [])
        .filter((item) => item.installment && item.installments > 0)
        .map((item) => {
          const paidCount = item.paidInstallments || 0
          const paidValue = (item.amount / item.installments) * paidCount

          return {
            cardId: card.id,
            cardBrand: card.brand,
            id: item.id,
            name: item.name,
            installments: item.installments,
            paidCount,
            total: item.amount,
            paidValue,
            remainingValue: item.amount - paidValue,
          }
        }),
    )
    .filter((purchase) => purchase.paidCount < purchase.installments)

  const totalValue = purchases.reduce((sum, purchase) => sum + purchase.total, 0)
  const paidValue = purchases.reduce((sum, purchase) => sum + purchase.paidValue, 0)
  const remainingValue = totalValue - paidValue
  const totalInstallments = purchases.reduce((sum, purchase) => sum + purchase.installments, 0)
  const paidInstallments = purchases.reduce((sum, purchase) => sum + purchase.paidCount, 0)
  const paidPercent = totalValue > 0 ? Math.min(100, Math.round((paidValue / totalValue) * 100)) : 0

  return (
    <article className="panel widget installments-summary">
      <div className="widget-header">
        <h3>Compras Parceladas</h3>
        <span className="widget-icon aqua">
          <CardTinyIcon />
        </span>
      </div>

      {purchases.length === 0 ? (
        <p className="installments-empty">
          Nenhuma compra parcelada ativa. Adicione uma na lista de compras de um cartão.
        </p>
      ) : (
        <>
          <div className="installments-stats">
            <div className="installments-stat">
              <span>Total</span>
              <strong>{formatCurrency(totalValue)}</strong>
            </div>
            <div className="installments-stat">
              <span>Pago</span>
              <strong className="installments-paid">{formatCurrency(paidValue)}</strong>
            </div>
            <div className="installments-stat">
              <span>Faltante</span>
              <strong className="installments-remaining">{formatCurrency(remainingValue)}</strong>
            </div>
          </div>

          <div className="limit-progress" aria-hidden="true">
            <span className="limit-progress-fill" style={{ width: `${paidPercent}%` }} />
          </div>
          <span className="limit-progress-caption">
            {paidInstallments} de {totalInstallments} parcelas pagas ({paidPercent}%)
          </span>

          <ul className="installments-list">
            {purchases.map((purchase) => (
              <li key={purchase.id}>
                <div className="installments-item-info">
                  <strong>{purchase.name}</strong>
                  <span>
                    {purchase.cardBrand} - {purchase.paidCount}/{purchase.installments} parcelas
                    pagas
                  </span>
                  <span>
                    Pago {formatCurrency(purchase.paidValue)} - Falta{' '}
                    {formatCurrency(purchase.remainingValue)} de {formatCurrency(purchase.total)}
                  </span>
                </div>
                <div className="expense-actions">
                  <button
                    className="expense-edit-button"
                    type="button"
                    aria-label={`Desfazer parcela paga de ${purchase.name}`}
                    disabled={purchase.paidCount === 0}
                    onClick={() => onAdjustPaid(purchase.cardId, purchase.id, -1)}
                  >
                    <MinusIcon />
                  </button>
                  <button
                    className="expense-edit-button"
                    type="button"
                    aria-label={`Marcar parcela de ${purchase.name} como paga`}
                    onClick={() => onAdjustPaid(purchase.cardId, purchase.id, 1)}
                  >
                    <PlusIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}
