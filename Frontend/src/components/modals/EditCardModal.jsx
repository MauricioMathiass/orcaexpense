import { Modal } from '../Modal'
import { CARD_COLOR_OPTIONS } from './AddCardModal'

export function EditCardModal({
  brand,
  network,
  lastDigits,
  holder,
  color,
  onBrandChange,
  onNetworkChange,
  onLastDigitsChange,
  onHolderChange,
  onColorChange,
  onCancel,
  onSubmit,
}) {
  return (
    <Modal>
      <div className="modal-card modal-card-wide">
        <h2>Editar cartão</h2>
        <p>Altere os dados exibidos na miniatura do cartão.</p>
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
            type="text"
            placeholder="Titular do cartão"
            value={holder}
            onChange={(event) => onHolderChange(event.target.value)}
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
              disabled={
                !brand.trim() || !network.trim() || !holder.trim() || lastDigits.length !== 4
              }
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
