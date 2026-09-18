import { CardsPanel } from '../components/CardsPanel'

export function CardsPage({ cardsState, onAddCard, onDeleteCard }) {
  return <CardsPanel cards={cardsState} onAddCard={onAddCard} onDeleteCard={onDeleteCard} standalone />
}
