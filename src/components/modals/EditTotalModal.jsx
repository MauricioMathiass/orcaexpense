import { Modal } from '../Modal'

export function EditTotalModal({ value, onChange, onCancel, onSubmit }) {
  return (
    <Modal>
      <div className="modal-card modal-card-wide">
        <h2>Editar valor total</h2>
        <p>Atualize o valor total de gastos exibido no resumo.</p>
        <form onSubmit={onSubmit}>
          <input
            className="modal-input"
            type="number"
            step="0.01"
            min="0"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoFocus
          />
          <div className="modal-actions">
            <button className="pill-button" type="button" onClick={onCancel}>
              Cancelar
            </button>
            <button
              className="pill-button pill-button-primary"
              type="submit"
              disabled={value.trim() === '' || Number(value) < 0}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
