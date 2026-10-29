import { CardsPanel } from '../components/CardsPanel'
import { ExpensesPanel } from '../components/ExpensesPanel'
import { InstallmentsSummary } from '../components/InstallmentsSummary'
import { ReceivablesSummary } from '../components/ReceivablesSummary'
import { CloseIcon, ActionIcon, TrashIcon } from '../components/icons'
import { formatCurrency } from '../utils/formatCurrency'
import './OverviewPage.css'

export const summaryActions = [
  { id: 'add', label: 'Adicionar', icon: 'plus' },
  { id: 'expenses', label: 'Despesas Fixas', icon: 'wallet' },
  { id: 'cards', label: 'Cartões', icon: 'card' },
  { id: 'installments', label: 'Compras Parceladas', icon: 'bag' },
  { id: 'third-party', label: 'Valores de Terceiros', icon: 'users' },
  { id: 'details', label: 'Detalhes', icon: 'details' },
]

export function OverviewPage({
  summaryActions,
  heroLabel,
  heroValue,
  onSummaryAction,
  cardsState,
  onAddCard,
  onDeleteCard,
  onEditCard,
  onAdjustPaidInstallments,
  expenses,
  onToggleExpense,
  onAddExpenseClick,
  onEditExpense,
  onDeleteExpense,
  customWidgets,
  onRemoveWidget,
  receivables,
  onResetContent,
}) {
  return (
    <>
      <header className="page-header">
        <h1>Visão Geral</h1>
        <p>Bem-vindo, aqui está o resumo de suas finanças</p>
      </header>

      <section className="hero-card">
        <div className="hero-top">
          <div>
            <span className="eyebrow">{heroLabel}</span>
            <strong className="hero-value">{formatCurrency(heroValue)}</strong>
          </div>
        </div>

        <div className="action-row">
          {summaryActions.map((action) => (
            <button
              className="pill-button"
              type="button"
              key={action.id}
              onClick={() => onSummaryAction(action.id)}
            >
              <ActionIcon type={action.icon} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <CardsPanel
        cards={cardsState}
        onAddCard={onAddCard}
        onDeleteCard={onDeleteCard}
        onEditCard={onEditCard}
      />

      <section className="widgets-grid">
        <ExpensesPanel
          expenses={expenses}
          onToggle={onToggleExpense}
          onAddClick={onAddExpenseClick}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
        />

        <InstallmentsSummary cards={cardsState} onAdjustPaid={onAdjustPaidInstallments} />

        <ReceivablesSummary receivables={receivables} />

        {customWidgets.map((widget) => (
          <article className="panel widget" key={widget.id}>
            <div className="widget-header">
              <h3>{widget.title}</h3>
              <button
                className="icon-button"
                type="button"
                aria-label={`Remover card ${widget.title}`}
                onClick={() => onRemoveWidget(widget.id)}
              >
                <CloseIcon />
              </button>
            </div>

            {widget.description && <p>{widget.description}</p>}
          </article>
        ))}
      </section>

      <div className="reset-row">
        <button className="pill-button reset-button" type="button" onClick={onResetContent}>
          <TrashIcon />
          <span>Zerar conteúdo</span>
        </button>
      </div>
    </>
  )
}
