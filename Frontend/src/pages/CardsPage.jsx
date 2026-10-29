import { CardsPanel } from '../components/CardsPanel'

export function CardsPage({
  cardsState,
  onAddCard,
  onDeleteCard,
  onEditCard,
  onAddChecklistItem,
  onEditChecklistItem,
  onDeleteChecklistItem,
}) {
  return (
    <CardsPanel
      cards={cardsState}
      onAddCard={onAddCard}
      onDeleteCard={onDeleteCard}
      onEditCard={onEditCard}
      onAddChecklistItem={onAddChecklistItem}
      onEditChecklistItem={onEditChecklistItem}
      onDeleteChecklistItem={onDeleteChecklistItem}
      standalone
    />
  )
}
