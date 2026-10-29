import { EditIcon, PlusIcon, TrashIcon } from './icons'
import { formatCurrency } from '../utils/formatCurrency'

export function CardChecklist({ items, onEdit, onDelete, onAdd }) {
  return (
    <div className="card-checklist">
      <div className="panel-heading">
        <div>
          <h2>Lista de Compras</h2>
          <p>Adicione, edite ou remova itens relacionados a este cartão.</p>
        </div>

        <button className="pill-button" type="button" onClick={onAdd}>
          <PlusIcon />
          <span>Adicionar</span>
        </button>
      </div>

      {items.length === 0 ? (
        <p className="checklist-empty">Nenhum item adicionado ainda.</p>
      ) : (
        <ul className="expense-list">
          {items.map((item) => (
            <li key={item.id}>
              <label>
                <span>{item.name}</span>
              </label>
              <div className="expense-actions">
                {item.installment && item.installments > 0 ? (
                  <>
                    <span className="widget-badge neutral">{item.installments}X</span>
                    <span className="expense-amount">
                      {formatCurrency((item.amount || 0) / item.installments)} /mes
                    </span>
                  </>
                ) : (
                  <span className="expense-amount">{formatCurrency(item.amount || 0)}</span>
                )}
                <button
                  className="expense-edit-button"
                  type="button"
                  aria-label={`Editar ${item.name}`}
                  onClick={() => onEdit(item)}
                >
                  <EditIcon />
                </button>
                <button
                  className="expense-edit-button expense-delete-button"
                  type="button"
                  aria-label={`Excluir ${item.name}`}
                  onClick={() => onDelete(item.id)}
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
