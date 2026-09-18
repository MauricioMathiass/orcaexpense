import { EditIcon, PlusIcon, TrashIcon } from './icons'
import { formatCurrency } from '../utils/formatCurrency'
import './ExpensesPanel.css'

export function ExpensesPanel({ expenses, onToggle, onAddClick, onEdit, onDelete, standalone }) {
  const list = (
    <ul className={`expense-list ${standalone ? 'expense-list-standalone' : ''}`}>
      {expenses.map((expense) => (
        <li key={expense.id}>
          <label>
            <input type="checkbox" checked={expense.paid} onChange={() => onToggle(expense.id)} />
            <span className={expense.paid ? 'expense-paid' : ''}>{expense.name}</span>
          </label>
          <div className="expense-actions">
            {standalone && (
              <span className="expense-amount">{formatCurrency(expense.amount || 0)}</span>
            )}
            <span className={`widget-badge ${expense.paid ? 'success' : 'warning'}`}>
              {expense.paid ? 'PAGO' : 'PENDENTE'}
            </span>
            <button
              className="expense-edit-button"
              type="button"
              aria-label={`Editar ${expense.name}`}
              onClick={() => onEdit(expense)}
            >
              <EditIcon />
            </button>
            <button
              className="expense-edit-button expense-delete-button"
              type="button"
              aria-label={`Excluir ${expense.name}`}
              onClick={() => onDelete(expense.id)}
            >
              <TrashIcon />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )

  if (standalone) {
    return (
      <section className="panel cards-panel">
        <div className="panel-heading">
          <div>
            <h2>Despesas Fixas</h2>
            <p>Acompanhe suas contas recorrentes e o status de pagamento.</p>
          </div>

          <button className="pill-button" type="button" onClick={onAddClick}>
            <PlusIcon />
            <span>Adicionar</span>
          </button>
        </div>

        {list}
      </section>
    )
  }

  return (
    <article className="panel widget">
      <div className="widget-header">
        <h3>Despesas Fixas</h3>
        <button className="widget-badge neutral" type="button" onClick={onAddClick}>
          ADICIONAR
        </button>
      </div>

      {list}
    </article>
  )
}
