import { useState } from 'react'
import { Modal } from './Modal'
import { CreditCardFace } from './CreditCardFace'
import { PlusIcon } from './icons'
import { formatCurrency } from '../utils/formatCurrency'
import './CardsPanel.css'

export function CardsPanel({ cards, onAddCard, onDeleteCard, standalone }) {
  const [selectedCard, setSelectedCard] = useState(null)

  const usedPercent = selectedCard
    ? Math.min(100, Math.round((selectedCard.spent / selectedCard.limit) * 100))
    : 0

  function handleDelete() {
    onDeleteCard(selectedCard.id)
    setSelectedCard(null)
  }

  const cardFacePreview = selectedCard && (
    <div
      className={`credit-card ${selectedCard.bgClass} ${
        standalone ? 'card-detail-face' : 'modal-card-preview'
      }`}
    >
      <CreditCardFace card={selectedCard} />
    </div>
  )

  const cardDetailInfo = selectedCard && (
    <div className="card-detail-info">
      <ul className="details-list">
        <li>
          <span>Valor gasto atual</span>
          <strong>{formatCurrency(selectedCard.spent)}</strong>
        </li>
        <li>
          <span>Limite disponivel</span>
          <strong>{formatCurrency(selectedCard.limit - selectedCard.spent)}</strong>
        </li>
        <li>
          <span>Limite total</span>
          <strong>{formatCurrency(selectedCard.limit)}</strong>
        </li>
      </ul>

      <div className="limit-progress" aria-hidden="true">
        <span className="limit-progress-fill" style={{ width: `${usedPercent}%` }} />
      </div>

      <div className="modal-actions">
        <button className="pill-button" type="button" onClick={() => setSelectedCard(null)}>
          {standalone ? 'Fechar detalhes' : 'Fechar'}
        </button>
        <button className="pill-button pill-button-danger" type="button" onClick={handleDelete}>
          Excluir cartao
        </button>
      </div>
    </div>
  )

  return (
    <>
      <section className="panel cards-panel">
        <div className="panel-heading">
          <div>
            <h2>Meus Cartoes</h2>
            <p>Gerencie seus limites e visualize seus gastos recorrentes.</p>
          </div>

          <div className="limit-box">
            <div className="limit-summary">
              <span>Limite Total</span>
              <strong>R$ 6.600,00</strong>
            </div>
            <div className="limit-progress" aria-hidden="true">
              <span className="limit-progress-fill" />
            </div>
          </div>
        </div>

        <div className="cards-grid">
          {cards.map((card) => (
            <article
              className={`credit-card ${card.bgClass}`}
              key={card.id}
              role="button"
              tabIndex={0}
              aria-label={`Ver detalhes do cartao ${card.brand}`}
              onClick={() => setSelectedCard(card)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedCard(card)
                }
              }}
            >
              <CreditCardFace card={card} />
            </article>
          ))}

          <button
            className="add-card-tile"
            type="button"
            aria-label="Adicionar novo cartao"
            onClick={onAddCard}
          >
            <span className="add-card-icon">
              <PlusIcon />
            </span>
          </button>
        </div>

        {selectedCard && !standalone && (
          <Modal>
            <div className="modal-card modal-card-wide modal-card-cardface">
              {cardFacePreview}
              {cardDetailInfo}
            </div>
          </Modal>
        )}
      </section>

      {selectedCard && standalone && (
        <section className="panel cards-panel">
          <div className="card-detail-panel">
            {cardFacePreview}
            {cardDetailInfo}
          </div>
        </section>
      )}
    </>
  )
}
