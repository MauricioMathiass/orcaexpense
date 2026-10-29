import { Modal } from '../Modal'

export function ResetContentModal({ onCancel, onConfirm }) {
  return (
    <Modal>
      <div className="modal-card">
        <h2>Zerar todo o conteúdo?</h2>
        <p>
          Todos os cartões, despesas, compras parceladas e valores de terceiros salvos neste
          navegador serão apagados. Essa ação não pode ser desfeita.
        </p>
        <div className="modal-actions">
          <button className="pill-button" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="pill-button pill-button-danger" type="button" onClick={onConfirm}>
            Sim, zerar tudo
          </button>
        </div>
      </div>
    </Modal>
  )
}
