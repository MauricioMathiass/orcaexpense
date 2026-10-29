import { Modal } from '../Modal'
import { formatCurrency } from '../../utils/formatCurrency'

export function ReceivableModal({
  title,
  description,
  submitLabel,
  namePlaceholder = 'Nome (ex: João)',
  nameRequired = true,
  nameOnly = false,
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
  onCancel,
  onSubmit,
}) {
  const installmentsCount = Number(installments) || 0
  const installmentValue = Number(installmentAmount) || 0
  const totalPreview =
    installment && installmentsCount > 0 && installmentValue > 0
      ? `Total a receber: ${formatCurrency(installmentsCount * installmentValue)}`
      : null

  return (
    <Modal>
      <div className="modal-card modal-card-wide">
        <h2>{title}</h2>
        <p>{description}</p>
        <form onSubmit={onSubmit}>
          <input
            className="modal-input"
            type="text"
            placeholder={namePlaceholder}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            autoFocus
          />

          {!nameOnly && (
            <>
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

              {installment ? (
                <>
                  <input
                    className="modal-input"
                    type="number"
                    step="1"
                    min="2"
                    placeholder="Número de parcelas"
                    value={installments}
                    onChange={(event) => onInstallmentsChange(event.target.value)}
                  />
                  <input
                    className="modal-input"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Valor da parcela (R$)"
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
            </>
          )}

          <div className="modal-actions">
            <button className="pill-button" type="button" onClick={onCancel}>
              Cancelar
            </button>
            <button
              className="pill-button pill-button-primary"
              type="submit"
              disabled={nameRequired && !name.trim()}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
