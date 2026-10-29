import { createPortal } from 'react-dom'
import './Modal.css'

export function Modal({ children }) {
  return createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      {children}
    </div>,
    document.body,
  )
}
