import { PlusIcon } from './icons'
import { formatCurrency } from '../utils/formatCurrency'
import './InstallmentPurchasesPanel.css'

export function InstallmentPurchasesPanel({ cards, onAddClick }) {
  const purchases = cards.flatMap((card) =>
    (card.checklist || [])
      .filter((item) => item.installment && item.installments > 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        cardBrand: card.brand,
        installments: item.installments,
        total: item.amount || 0,
        monthly: (item.amount || 0) / item.installments,
      })),
  )

  const total = purchases.reduce((sum, purchase) => sum + purchase.total, 0)

  return (
    <section className="panel cards-panel">
      <div className="panel-heading">
        <div>
          <h2>Compras Parceladas</h2>
          <p>Compras parceladas cadastradas na Lista de Compras dos cartões.</p>
        </div>

        <div className="expenses-heading-side">
          <div className="expenses-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <button
            className="pill-button expenses-add-button"
            type="button"
            disabled={cards.length === 0}
            onClick={onAddClick}
          >
            <PlusIcon />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {purchases.length === 0 ? (
        <p className="checklist-empty">Nenhuma compra parcelada cadastrada.</p>
      ) : (
        <ul className="expense-list expense-list-standalone">
          {purchases.map((purchase) => (
            <li key={purchase.id}>
              <div className="installment-purchase-info">
                <strong>{purchase.name}</strong>
                <span>
                  {purchase.cardBrand} - Total {formatCurrency(purchase.total)}
                </span>
              </div>
              <div className="expense-actions">
                <span className="widget-badge neutral">{purchase.installments}X</span>
                <span className="expense-amount">{formatCurrency(purchase.monthly)} /mes</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
