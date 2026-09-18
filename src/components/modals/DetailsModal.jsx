import { Modal } from '../Modal'
import { formatCurrency } from '../../utils/formatCurrency'

export function DetailsModal({ totalValue, cardsCount, paidCount, pendingCount, onClose }) {
  return (
    <Modal>
      <div className="modal-card modal-card-wide">
        <h2>Detalhes financeiros</h2>
        <div className="details-grid">
          <div className="detail-card">
            <span>Valor total de gastos</span>
            <strong>{formatCurrency(totalValue)}</strong>
          </div>
          <div className="detail-card">
            <span>Limite total dos cartoes</span>
            <strong>R$ 6.600,00</strong>
          </div>
          <div className="detail-card">
            <span>Cartoes cadastrados</span>
            <strong>{cardsCount}</strong>
          </div>
          <div className="detail-card">
            <span>Despesas fixas pagas</span>
            <strong>{paidCount}</strong>
          </div>
          <div className="detail-card detail-card-wide">
            <span>Despesas fixas pendentes</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
        <div className="modal-actions">
          <button className="pill-button" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
