import { EditIcon, PlusIcon, TrashIcon } from './icons'
import { formatCurrency } from '../utils/formatCurrency'
import { roundMoney } from '../utils/money'
import './ExpensesPanel.css'

export function ExpensesPanel({
  expenses,
  onToggle,
  onAddClick,
  onAddCardClick,
  onEdit,
  onDelete,
  standalone,
}) {
  function renderList(items, emptyMessage) {
    if (items.length === 0) {
      return <p className="checklist-empty">{emptyMessage}</p>
    }

    return (
      <ul className={`expense-list ${standalone ? 'expense-list-standalone' : ''}`}>
        {items.map((expense) => (
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
              {expense.cardId ? (
                <span className="expense-action-spacer" aria-hidden="true" />
              ) : (
                <button
                  className="expense-edit-button expense-delete-button"
                  type="button"
                  aria-label={`Excluir ${expense.name}`}
                  onClick={() => onDelete(expense.id)}
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (standalone) {
    const cardBills = expenses.filter((expense) => expense.cardId)
    const monthlyExpenses = expenses.filter((expense) => !expense.cardId)
    const summarize = (items) => {
      const sum = (list) => roundMoney(list.reduce((total, expense) => total + (expense.amount || 0), 0))
      const total = sum(items)
      const paid = sum(items.filter((expense) => expense.paid))
      return { total, paid, pending: roundMoney(total - paid) }
    }

    const billsSummary = summarize(cardBills)
    const monthlySummary = summarize(monthlyExpenses)
    const grand = summarize(expenses)
    const paidPercent = grand.total > 0 ? Math.min(100, Math.round((grand.paid / grand.total) * 100)) : 0

    const renderPaidCaption = ({ paid, pending }) => (
      <small className="expenses-total-caption">
        Pago {formatCurrency(paid)} - Pendente {formatCurrency(pending)}
      </small>
    )

    return (
      <>
        <section className="panel expenses-grand-total">
          <span className="expenses-grand-total-label">Total Geral</span>
          <strong className="expenses-grand-total-value">{formatCurrency(grand.pending)}</strong>
          <span className="expenses-grand-total-caption">
            Pendente de Cartões + Despesas Fixas Mensais
          </span>

          <div className="limit-progress expenses-grand-total-progress" aria-hidden="true">
            <span className="limit-progress-fill" style={{ width: `${paidPercent}%` }} />
          </div>
          <span className="expenses-grand-total-caption">
            Pago {formatCurrency(grand.paid)} de {formatCurrency(grand.total)} ({paidPercent}%)
          </span>
        </section>

        <section className="panel cards-panel">
          <div className="panel-heading">
            <div>
              <h2>Cartões</h2>
              <p>Faturas dos cartões cadastrados e o status de pagamento.</p>
            </div>

            <div className="expenses-heading-side">
              <div className="expenses-total">
                <span>Total</span>
                <strong>{formatCurrency(billsSummary.total)}</strong>
                {renderPaidCaption(billsSummary)}
              </div>

              <button
                className="pill-button expenses-add-button"
                type="button"
                onClick={onAddCardClick}
              >
                <PlusIcon />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {renderList(cardBills, 'Nenhuma fatura de cartão cadastrada.')}
        </section>

        <section className="panel cards-panel">
          <div className="panel-heading">
            <div>
              <h2>Despesas Fixas Mensais</h2>
              <p>Acompanhe suas contas recorrentes e o status de pagamento.</p>
            </div>

            <div className="expenses-heading-side">
              <div className="expenses-total">
                <span>Total</span>
                <strong>{formatCurrency(monthlySummary.total)}</strong>
                {renderPaidCaption(monthlySummary)}
              </div>

              <button
                className="pill-button expenses-add-button"
                type="button"
                onClick={onAddClick}
              >
                <PlusIcon />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {renderList(monthlyExpenses, 'Nenhuma despesa fixa cadastrada.')}
        </section>
      </>
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

      {renderList(expenses, 'Nenhuma despesa cadastrada.')}
    </article>
  )
}
