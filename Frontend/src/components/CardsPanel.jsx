 import { useState } from 'react'
import { Modal } from './Modal'
import { CreditCardFace } from './CreditCardFace'
import { CardChecklist } from './CardChecklist'
import { EditIcon, PlusIcon } from './icons'
import { formatCurrency } from '../utils/formatCurrency'
import './CardsPanel.css'

export function CardsPanel({
  cards,
  onAddCard,
  onDeleteCard,
  standalone,
  onAddChecklistItem,
  onEditChecklistItem,
  onDeleteChecklistItem,
  onEditCard,
}) {
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const selectedCard = cards.find((card) => card.id === selectedCardId) || null

  const usedPercent = !selectedCard
    ? 0
    : selectedCard.limit > 0
      ? Math.min(100, Math.round((selectedCard.spent / selectedCard.limit) * 100))
      : selectedCard.spent > 0
        ? 100
        : 0

  const limitTotal = cards.reduce((sum, card) => sum + card.limit, 0)
  const spentTotal = cards.reduce((sum, card) => sum + card.spent, 0)
  const overallUsedPercent =
    limitTotal > 0 ? Math.min(100, Math.round((spentTotal / limitTotal) * 100)) : 0

  function handleCardActivate(card) {
    if (editMode) {
      setEditMode(false)
      onEditCard(card)
    } else {
      setSelectedCardId(card.id)
    }
  }

  function handleEditSelected() {
    const card = selectedCard
    if (!standalone) setSelectedCardId(null)
    onEditCard(card)
  }

  function handleDelete() {
    onDeleteCard(selectedCard.id)
    setSelectedCardId(null)
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
          <span>Limite disponível</span>
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
        <button className="pill-button" type="button" onClick={() => setSelectedCardId(null)}>
          {standalone ? 'Fechar detalhes' : 'Fechar'}
        </button>
        {onEditCard && (
          <button className="pill-button" type="button" onClick={handleEditSelected}>
            Editar cartão
          </button>
        )}
        <button className="pill-button pill-button-danger" type="button" onClick={handleDelete}>
          Excluir cartão
        </button>
      </div>
    </div>
  )

  return (
    <>
      {standalone && (
        <section className="panel cards-total-card">
          <span className="cards-total-label">Total dos Cartões</span>
          <strong className="cards-total-value">{formatCurrency(spentTotal)}</strong>
          <span className="cards-total-caption">
            Soma do gasto atual de {cards.length} {cards.length === 1 ? 'cartão' : 'cartões'}
          </span>
        </section>
      )}

      <section className="panel cards-panel">
        <div className="panel-heading">
          <div>
            <div className="cards-title-row">
              <h2>Meus Cartões</h2>
              {onEditCard && !standalone && (
                <button
                  className={`icon-button cards-edit-toggle ${editMode ? 'active' : ''}`}
                  type="button"
                  aria-label="Editar cartões"
                  aria-pressed={editMode}
                  onClick={() => setEditMode((current) => !current)}
                >
                  <EditIcon />
                </button>
              )}
            </div>
            <p>
              {editMode
                ? 'Selecione um cartão para editar os dados dele.'
                : 'Gerencie seus limites e visualize seus gastos recorrentes.'}
            </p>
          </div>

          <div className="limit-box">
            <div className="limit-summary">
              <span>Limite Disponível</span>
              <strong>{formatCurrency(limitTotal - spentTotal)}</strong>
            </div>
            <div className="limit-progress" aria-hidden="true">
              <span className="limit-progress-fill" style={{ width: `${overallUsedPercent}%` }} />
            </div>
            <span className="limit-progress-caption">
              {formatCurrency(spentTotal)} de {formatCurrency(limitTotal)} ({overallUsedPercent}%)
            </span>
          </div>
        </div>

        <div className="cards-grid">
          {cards.map((card) => (
            <article
              className={`credit-card ${card.bgClass} ${editMode ? 'is-editing' : ''}`}
              key={card.id}
              role="button"
              tabIndex={0}
              aria-label={`${editMode ? 'Editar' : 'Ver detalhes do'} cartão ${card.brand}`}
              onClick={() => handleCardActivate(card)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleCardActivate(card)
                }
              }}
            >
              <CreditCardFace card={card} />
              {editMode && (
                <span className="card-edit-badge" aria-hidden="true">
                  <EditIcon />
                </span>
              )}
            </article>
          ))}

          <button
            className="add-card-tile"
            type="button"
            aria-label="Adicionar novo cartão"
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

      {selectedCard && standalone && (
        <section className="panel cards-panel">
          <CardChecklist
            items={selectedCard.checklist || []}
            onAdd={() => onAddChecklistItem(selectedCard.id)}
            onEdit={(item) => onEditChecklistItem(selectedCard.id, item)}
            onDelete={(itemId) => onDeleteChecklistItem(selectedCard.id, itemId)}
          />
        </section>
      )}
    </>
  )
}
