export function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="m5 19 3.2-.6L18 8.6 15.4 6 5.6 15.8 5 19Z" />
      <path d="m13.9 7.4 2.7 2.7" />
    </svg>
  )
}

export function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5H18v14H7.5A2.5 2.5 0 0 1 5 16.5v-9Z" />
      <path d="M18 9h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2" />
      <circle cx="16.5" cy="12" r="1" />
    </svg>
  )
}

export function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M5 17 10 12l3 3 6-7" />
      <path d="M16 8h3v3" />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

export function DetailsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 10v4" />
      <path d="M12 7.5h.01" />
    </svg>
  )
}

export function SumIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M6 5h11l-6 7 6 7H6" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M5 7h14" />
      <path d="M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M7 7l1 12.5A1.5 1.5 0 0 0 9.5 21h5a1.5 1.5 0 0 0 1.5-1.5L17 7" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

export function CardTinyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <rect x="4" y="6.5" width="16" height="11" rx="2" />
      <path d="M4 10.5h16" />
    </svg>
  )
}

export function ContactlessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="contactless-icon" aria-hidden="true">
      <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <path d="M9 8.5a6 6 0 0 1 0 7" />
      <path d="M12.5 6a9.5 9.5 0 0 1 0 12" />
      <path d="M16 4a13 13 0 0 1 0 16" />
    </svg>
  )
}

export function ActionIcon({ type }) {
  if (type === 'plus') return <PlusIcon />
  if (type === 'wallet') return <WalletIcon />
  if (type === 'card') return <CardTinyIcon />
  if (type === 'sum') return <SumIcon />
  return <DetailsIcon />
}
