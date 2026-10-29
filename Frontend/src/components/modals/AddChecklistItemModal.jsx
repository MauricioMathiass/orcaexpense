import { Modal } from '../Modal'
import { formatCurrency } from '../../utils/formatCurrency'

export function AddChecklistItemModal({
  name,
  amount,
  installment,
  installments,
  installmentAmount,
  onNameChange,
  onAmountChange,
  onInstallmentChange,
  onInstallmentsChange,
  onInstallmentAmountChange,
  cards,
  cardId,
  onCardChange,
  onCancel,
  onSubmit,
}) {
  const requiresInstallment = Boolean(cards)
  const isInstallment = installment || requiresInstallment
  const installmentsCount = Number(installments) || 0
  const installmentValue = Number(installmentAmount) || 0
  const totalPreview =
    isInstallment && installmentsCount > 0 && installmentValue > 0
      ? `Total da compra: ${formatCurrency(installmentsCount * installmentValue)}`
      : null

  return (
    <Modal>
      <div className="modal-card modal-card-wide">
        <h2>Novo item</h2>
        <p>
          {requiresInstallment
            ? 'Cadastre uma compra parcelada em um dos cartões.'
            : 'Adicione um item ou compra a este cartão.'}
        </p>
        <form onSubmit={onSubmit}>
          {cards && (
            <select
              className="modal-input"
              aria-label="Cartão"
              value={cardId}
              onChange={(event) =>
                onCardChange(cards.find((card) => String(card.id) === event.target.value).id)
              }
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.brand}
                </option>
              ))}
            </select>
          )}
          <input
            className="modal-input"
            type="text"
            placeholder="Ex: Fone de ouvido"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            autoFocus
          />
          {!requiresInstallment && (
            <div className="toggle-field">
              <span className="toggle-field-label">Compra parcelada?</span>
              <div className="toggle-options">
                <button
                  type="button"
                  className={`toggle-option ${!installment ? 'selected' : ''}`}
                  onClick={() => onInstallmentChange(false)}
                >
                  Não
                </button>
                <button
                  type="button"
                  className={`toggle-option ${installment ? 'selected' : ''}`}
                  onClick={() => onInstallmentChange(true)}
                >
                  Sim
                </button>
              </div>
            </div>
          )}

          {isInstallment ? (
            <>
              <input
                className="modal-input"
                type="number"
                step="1"
                min="2"
                placeholder="Número de parcelas"
                required={requiresInstallment}
                value={installments}
                onChange={(event) => onInstallmentsChange(event.target.value)}
              />
              <input
                className="modal-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor da parcela (R$)"
                required={requiresInstallment}
                value={installmentAmount}
                onChange={(event) => onInstallmentAmountChange(event.target.value)}
              />
              {totalPreview && <p className="installment-preview">{totalPreview}</p>}
            </>
          ) : (
            <input
              className="modal-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="Valor (R$)"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
            />
          )}

          <div className="modal-actions">
            <button className="pill-button" type="button" onClick={onCancel}>
              Cancelar
            </button>
            <button
              className="pill-button pill-button-primary"
              type="submit"
              disabled={!name.trim()}
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
