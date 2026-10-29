import { Modal } from '../Modal'

export function AddWidgetModal({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onCancel,
  onSubmit,
}) {
  return (
    <Modal>
      <div className="modal-card modal-card-wide">
        <h2>Novo card</h2>
        <p>Crie um card personalizado para o seu dashboard.</p>
        <form onSubmit={onSubmit}>
          <input
            className="modal-input"
            type="text"
            placeholder="Título (ex: Metas do mês)"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            autoFocus
          />
          <textarea
            className="modal-input modal-textarea"
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
          <div className="modal-actions">
            <button className="pill-button" type="button" onClick={onCancel}>
              Cancelar
            </button>
            <button
              className="pill-button pill-button-primary"
              type="submit"
              disabled={!title.trim()}
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
