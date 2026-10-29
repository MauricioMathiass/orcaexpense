import { Fragment, useState } from 'react'
import { CloseIcon, EditIcon, MinusIcon, PlusIcon, TrashIcon } from './icons'
import { formatCurrency } from '../utils/formatCurrency'
import { roundMoney } from '../utils/money'
import {
  getActivePurchases,
  getPaidInstallments,
  getReceivablePartialTotal,
  getReceivableReceivedAmount,
  getReceivedAmount,
  isInstallmentPurchase,
} from '../utils/receivables'
import './ExpensesPanel.css'
import './ReceivablesPanel.css'

export function ReceivablesPanel({
  receivables,
  onTogglePurchase,
  onAdjustPaid,
  onAddClick,
  onAddPurchase,
  onEdit,
  onEditPurchase,
  onDelete,
  onDeletePurchase,
}) {
  const [detailsId, setDetailsId] = useState(null)
  const detailsItem = receivables.find((item) => item.id === detailsId)
  function toggleDetails(id) {
    setDetailsId((current) => (current === id ? null : id))
  }

  function handleCardKeyDown(event, id) {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleDetails(id)
    }
  }

  const total = roundMoney(receivables.reduce((sum, item) => sum + (item.amount || 0), 0))
  const received = roundMoney(
    receivables.reduce((sum, item) => sum + getReceivableReceivedAmount(item), 0),
  )
  const pending = roundMoney(total - received)
  const receivedPercent = total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0
  const isEmpty = receivables.length === 0

  function renderPurchase(item, purchase, index) {
    const title = purchase.label || `Compra ${index + 1}`

    if (!isInstallmentPurchase(purchase)) {
      return (
        <li key={purchase.id}>
          <div className="receivable-purchase-info">
            <strong>{title}</strong>
            <span>Pagamento à vista - {formatCurrency(purchase.amount)}</span>
          </div>
          <div className="expense-actions">
            <label className="receivable-mini-check">
              <input
                type="checkbox"
                checked={purchase.received}
                onChange={() => onTogglePurchase(item.id, purchase.id)}
              />
              <span>Recebido</span>
            </label>
            {renderPurchaseActions(item, purchase, title)}
          </div>
        </li>
      )
    }

    const paidCount = getPaidInstallments(purchase)
    const installmentValue = roundMoney(purchase.amount / purchase.installments)

    return (
      <li key={purchase.id}>
        <div className="receivable-purchase-info">
          <strong>{title}</strong>
          <span>
            {formatCurrency(installmentValue)} por parcela - Total {formatCurrency(purchase.amount)}
          </span>
        </div>
        <div className="expense-actions">
          <button
            className="expense-edit-button"
            type="button"
            aria-label={`Desfazer parcela paga de ${title}`}
            disabled={paidCount === 0}
            onClick={() => onAdjustPaid(item.id, purchase.id, -1)}
          >
            <MinusIcon />
          </button>
          <button
            className="expense-edit-button"
            type="button"
            aria-label={`Marcar parcela de ${title} como paga`}
            disabled={paidCount === purchase.installments}
            onClick={() => onAdjustPaid(item.id, purchase.id, 1)}
          >
            <PlusIcon />
          </button>
          {renderPurchaseActions(item, purchase, title)}
        </div>
        {renderPurchaseCounts(purchase)}
      </li>
    )
  }

  function renderPurchaseActions(item, purchase, title) {
    return (
      <>
        <button
          className="expense-edit-button"
          type="button"
          aria-label={`Editar ${title}`}
          onClick={() => onEditPurchase(item, purchase)}
        >
          <EditIcon />
        </button>
        {item.purchases.length > 1 ? (
          <button
            className="expense-edit-button expense-delete-button"
            type="button"
            aria-label={`Excluir ${title}`}
            onClick={() => onDeletePurchase(item.id, purchase.id)}
          >
            <TrashIcon />
          </button>
        ) : (
          <span className="expense-action-spacer" aria-hidden="true" />
        )}
      </>
    )
  }

  function renderDetails(item) {
    const receivedValue = getReceivableReceivedAmount(item)
    const remainingValue = roundMoney((item.amount || 0) - receivedValue)
    const progress =
      item.amount > 0 ? Math.min(100, Math.round((receivedValue / item.amount) * 100)) : 0

    return (
      <section className="panel receivable-details" aria-label={`Detalhes de ${item.name}`}>
        <div className="receivable-details-header">
          <div className="receivable-details-title">
            <h2>{item.name}</h2>
            <span className={`widget-badge ${item.received ? 'success' : 'warning'}`}>
              {item.received ? 'RECEBIDO' : 'PENDENTE'}
            </span>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Fechar detalhes"
            onClick={() => setDetailsId(null)}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="limit-progress" aria-hidden="true">
          <span className="limit-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="receivable-details-footer">
          <div className="receivable-details-values">
            <span>
              Recebido <strong>{formatCurrency(receivedValue)}</strong>
            </span>
            <span>
              A receber <strong>{formatCurrency(remainingValue)}</strong>
            </span>
            <span>
              Total <strong>{formatCurrency(item.amount || 0)}</strong>
            </span>
          </div>

          <button
            className="pill-button receivable-add-purchase"
            type="button"
            onClick={() => onAddPurchase(item)}
          >
            <PlusIcon />
            <span>Adicionar compra</span>
          </button>
        </div>

        <ul className="receivable-purchases">
          {item.purchases.map((purchase, index) => renderPurchase(item, purchase, index))}
        </ul>
      </section>
    )
  }

  // Valor dinâmico: o que ainda falta receber da compra (parcelas pagas abatidas).
  function getRemaining(purchase) {
    return roundMoney(purchase.amount - getReceivedAmount(purchase))
  }

  function describeCashPurchase(purchase) {
    return purchase.received ? 'À vista - recebido' : 'Pagamento à vista'
  }

  // Contador de parcelas de uma compra, independente das demais compras da pessoa.
  function renderPurchaseCounts(purchase) {
    const paidCount = getPaidInstallments(purchase)

    return (
      <div className="receivable-purchase-counts">
        <div className="receivable-details-stat">
          <span>Parcelas ativas</span>
          <strong>{purchase.installments}</strong>
        </div>
        <div className="receivable-details-stat">
          <span>Parcelas pagas</span>
          <strong className="receivable-stat-paid">{paidCount}</strong>
        </div>
        <div className="receivable-details-stat">
          <span>Parcelas faltantes</span>
          <strong className="receivable-stat-remaining">{purchase.installments - paidCount}</strong>
        </div>
      </div>
    )
  }

  // Total parcial de todo mini card: soma do valor de cada compra ativa, igual ao que aparece
  // na lista (valor individual da parcela, ou o valor da compra à vista ainda não recebida).
  function renderPartialTotal(item) {
    const active = getActivePurchases(item)
    const partial = getReceivablePartialTotal(item)

    return (
      <div className="receivable-mini-partial">
        <div>
          <span>Total parcial</span>
          <small>
            Soma de {active.length} {active.length === 1 ? 'compra ativa' : 'compras ativas'}
          </small>
        </div>
        <strong>{formatCurrency(partial)}</strong>
      </div>
    )
  }

  // Cada compra aparece separada, sem somar os valores no mini card.
  function renderMiniValue(item) {
    return (
      <ul className="receivable-mini-purchases">
        {item.purchases.map((purchase, index) => {
          const title = purchase.label || `Compra ${index + 1}`
          const isInstallment = isInstallmentPurchase(purchase)
          const paidCount = getPaidInstallments(purchase)

          return (
            <li key={purchase.id}>
              <label
                className="receivable-mini-purchase-check"
                onClick={(event) => event.stopPropagation()}
              >
                <input
                  type="checkbox"
                  aria-label={`Recebido: ${title}`}
                  checked={purchase.received}
                  onChange={() => onTogglePurchase(item.id, purchase.id)}
                />
                <span className="receivable-mini-purchase-info">
                  <span>{title}</span>
                  <small>
                    {isInstallment
                      ? `${formatCurrency(roundMoney(purchase.amount / purchase.installments))} por parcela`
                      : describeCashPurchase(purchase)}
                  </small>
                </span>
              </label>
              <strong>{formatCurrency(getRemaining(purchase))}</strong>

              {isInstallment && renderPurchaseCounts(purchase)}

              {isInstallment && (
                <div
                  className="receivable-mini-stepper"
                  onClick={(event) => event.stopPropagation()}
                >
                  <span>Parcelas pagas</span>
                  <div className="expense-actions">
                    <button
                      className="expense-edit-button"
                      type="button"
                      aria-label={`Desfazer parcela paga de ${title}`}
                      disabled={paidCount === 0}
                      onClick={() => onAdjustPaid(item.id, purchase.id, -1)}
                    >
                      <MinusIcon />
                    </button>
                    <button
                      className="expense-edit-button"
                      type="button"
                      aria-label={`Marcar parcela de ${title} como paga`}
                      disabled={paidCount === purchase.installments}
                      onClick={() => onAdjustPaid(item.id, purchase.id, 1)}
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  function renderMiniCard(item) {
    return (
      <article
        className={`panel receivable-mini-card ${item.received ? 'is-received' : ''} ${
          item.id === detailsId ? 'is-selected' : ''
        }`}
        role="button"
        tabIndex={0}
        aria-pressed={item.id === detailsId}
        aria-label={`Ver detalhes de ${item.name}`}
        onClick={() => toggleDetails(item.id)}
        onKeyDown={(event) => handleCardKeyDown(event, item.id)}
      >
        <div className="receivable-mini-top">
          <strong className="receivable-mini-name">{item.name}</strong>
          <span className={`widget-badge ${item.received ? 'success' : 'warning'}`}>
            {item.received ? 'RECEBIDO' : 'PENDENTE'}
          </span>
        </div>

        {renderMiniValue(item)}

        {renderPartialTotal(item)}

        <button
          className="receivable-mini-add"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onAddPurchase(item)
          }}
        >
          <PlusIcon />
          <span>Adicionar compra</span>
        </button>

        <div className="receivable-mini-footer" onClick={(event) => event.stopPropagation()}>
          <div className="expense-actions">
            <button
              className="expense-edit-button"
              type="button"
              aria-label={`Editar ${item.name}`}
              onClick={() => onEdit(item)}
            >
              <EditIcon />
            </button>
            <button
              className="expense-edit-button expense-delete-button"
              type="button"
              aria-label={`Excluir ${item.name}`}
              onClick={() => onDelete(item.id)}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>Valores de Terceiros</h1>
        <p>Acompanhe os valores que terceiros devem a você e o status de recebimento</p>
      </header>

      <div className="receivables-toolbar">
        <section className="panel expenses-grand-total">
          <span className="expenses-grand-total-label">Total Geral</span>
          <strong className="expenses-grand-total-value">{formatCurrency(pending)}</strong>
          <span className="expenses-grand-total-caption">
            A receber de todas as cobranças (parcelas pagas abatidas)
          </span>

          <div className="limit-progress expenses-grand-total-progress" aria-hidden="true">
            <span className="limit-progress-fill" style={{ width: `${receivedPercent}%` }} />
          </div>
          <span className="expenses-grand-total-caption">
            Recebido {formatCurrency(received)} de {formatCurrency(total)} ({receivedPercent}%)
          </span>
        </section>

        <button className="pill-button expenses-add-button" type="button" onClick={onAddClick}>
          <PlusIcon />
          <span>Adicionar nova cobrança</span>
        </button>
      </div>

      {isEmpty && <p className="checklist-empty receivables-empty">Nenhum valor cadastrado.</p>}

      {detailsItem && renderDetails(detailsItem)}

      {!isEmpty && (
        <div className="receivable-grid">
          {receivables.map((item) => (
            <Fragment key={item.id}>{renderMiniCard(item)}</Fragment>
          ))}
        </div>
      )}
    </>
  )
}
