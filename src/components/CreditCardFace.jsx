import { ContactlessIcon } from './icons'

export function CreditCardFace({ card }) {
  return (
    <>
      <div className="credit-card-top">
        <div className="card-chip-wrap">
          <span className="card-chip" />
          <ContactlessIcon />
        </div>
        <div className="card-brand">
          <span className="card-network">{card.network}</span>
          <strong>{card.brand}</strong>
        </div>
      </div>

      <div className="credit-card-number">**** **** **** {card.lastDigits}</div>

      <div className="credit-card-meta">
        <span className="card-label">CARD HOLDER</span>
        <span className="card-label">VALID THRU</span>
      </div>

      <div className="credit-card-footer">
        <span>{card.holder}</span>
        <div className="card-footer-right">
          <span>12/29</span>
          <span className="mini-chip" />
        </div>
      </div>
    </>
  )
}
