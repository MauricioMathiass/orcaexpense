import { Modal } from '../Modal'

export function LogoutModal({ onCancel, onConfirm }) {
  return (
    <Modal>
      <div className="modal-card">
        <h2>Sair da sua conta?</h2>
        <p>Voce podera entrar novamente quando quiser.</p>
        <div className="modal-actions">
          <button className="pill-button" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="pill-button pill-button-danger" type="button" onClick={onConfirm}>
            Sim, sair
          </button>
        </div>
      </div>
    </Modal>
  )
}
