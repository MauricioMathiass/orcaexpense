import { CardsPanel } from '../components/CardsPanel'
import { ExpensesPanel } from '../components/ExpensesPanel'
import { EditIcon, WalletIcon, TrendIcon, CloseIcon, ActionIcon } from '../components/icons'
import { formatCurrency } from '../utils/formatCurrency'
import './OverviewPage.css'

export function OverviewPage({
  summaryActions,
  heroLabel,
  heroValue,
  heroMode,
  onEditTotal,
  onSummaryAction,
  cardsState,
  onAddCard,
  onDeleteCard,
  expenses,
  onToggleExpense,
  onAddExpenseClick,
  onEditExpense,
  onDeleteExpense,
  customWidgets,
  onRemoveWidget,
}) {
  return (
    <>
      <header className="page-header">
        <h1>Visao Geral</h1>
        <p>Bem-vindo, aqui esta o resumo de suas financas</p>
      </header>

      <section className="hero-card">
        <div className="hero-top">
          <div>
            <span className="eyebrow">{heroLabel}</span>
            <strong className="hero-value">{formatCurrency(heroValue)}</strong>
          </div>

          {heroMode === 'geral' && (
            <button
              className="icon-button"
              type="button"
              aria-label="Editar resumo"
              onClick={onEditTotal}
            >
              <EditIcon />
            </button>
          )}
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

      <CardsPanel cards={cardsState} onAddCard={onAddCard} onDeleteCard={onDeleteCard} />

      <section className="widgets-grid">
        <ExpensesPanel
          expenses={expenses}
          onToggle={onToggleExpense}
          onAddClick={onAddExpenseClick}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
        />

        <article className="panel widget">
          <div className="widget-header">
            <h3>Atividade 2</h3>
            <span className="widget-icon aqua">
              <WalletIcon />
            </span>
          </div>

          <p>Controle de pagamentos pendentes e agendamentos futuros.</p>
        </article>

        <article className="panel widget">
          <div className="widget-header">
            <h3>Atividade 3</h3>
            <span className="widget-icon green">
              <TrendIcon />
            </span>
          </div>

          <p>Analise de metas de economia e projecoes para o proximo mes.</p>
        </article>

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
    </>
  )
}
