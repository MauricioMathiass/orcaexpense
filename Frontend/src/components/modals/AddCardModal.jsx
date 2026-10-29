import { Modal } from '../Modal'

export const CARD_COLOR_OPTIONS = [
  { value: 'card-dark', label: 'Preto' },
  { value: 'card-blue', label: 'Azul' },
  { value: 'card-purple', label: 'Roxo' },
  { value: 'card-red', label: 'Vermelho' },
  { value: 'card-orange', label: 'Laranja' },
  { value: 'card-green', label: 'Verde' },
]

export function AddCardModal({
  brand,
  network,
  lastDigits,
  limit,
  spent,
  color,
  onBrandChange,
  onNetworkChange,
  onLastDigitsChange,
  onLimitChange,
  onSpentChange,
  onColorChange,
  onCancel,
  onSubmit,
}) {
  return (
    <Modal>
      <div className="modal-card modal-card-wide">
        <h2>Novo cartão</h2>
        <p>Cadastre um cartão para acompanhar limite e gastos.</p>
        <form onSubmit={onSubmit}>
          <input
            className="modal-input"
            type="text"
            placeholder="Nome do cartão (ex: Nubank)"
            value={brand}
            onChange={(event) => onBrandChange(event.target.value)}
            autoFocus
          />
          <input
            className="modal-input"
            type="text"
            placeholder="Bandeira (ex: Visa, Mastercard)"
            value={network}
            onChange={(event) => onNetworkChange(event.target.value)}
          />
          <input
            className="modal-input"
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="Últimos 4 dígitos"
            value={lastDigits}
            onChange={(event) => onLastDigitsChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
          />
          <input
            className="modal-input"
            type="number"
            step="0.01"
            min="0"
            placeholder="Limite total (R$)"
            value={limit}
            onChange={(event) => onLimitChange(event.target.value)}
          />
          <input
            className="modal-input"
            type="number"
            step="0.01"
            min="0"
            placeholder="Valor gasto atual (opcional)"
            value={spent}
            onChange={(event) => onSpentChange(event.target.value)}
          />
          <div className="color-swatch-row">
            {CARD_COLOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`color-swatch ${option.value} ${color === option.value ? 'selected' : ''}`}
                aria-label={option.label}
                onClick={() => onColorChange(option.value)}
              />
            ))}
          </div>
          <div className="modal-actions">
            <button className="pill-button" type="button" onClick={onCancel}>
              Cancelar
            </button>
            <button
              className="pill-button pill-button-primary"
              type="submit"
              disabled={!brand.trim() || !network.trim() || lastDigits.length !== 4}
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
