import { Modal } from '../Modal'

export function AddExpenseModal({ name, amount, onNameChange, onAmountChange, onCancel, onSubmit }) {
  return (
    <Modal>
      <div className="modal-card modal-card-wide">
        <h2>Nova despesa fixa</h2>
        <p>Adicione uma conta para acompanhar o pagamento.</p>
        <form onSubmit={onSubmit}>
          <input
            className="modal-input"
            type="text"
            placeholder="Ex: Streaming"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            autoFocus
          />
          <input
            className="modal-input"
            type="number"
            step="0.01"
            min="0"
            placeholder="Valor (R$)"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
          />
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
