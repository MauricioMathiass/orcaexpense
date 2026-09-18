import { useState } from 'react'
import { createPortal } from 'react-dom'
import { SidebarMenu } from './SidebarMenu'

const CARD_COLOR_OPTIONS = [
  { value: 'card-dark', label: 'Preto' },
  { value: 'card-blue', label: 'Azul' },
  { value: 'card-purple', label: 'Roxo' },
  { value: 'card-red', label: 'Vermelho' },
  { value: 'card-orange', label: 'Laranja' },
  { value: 'card-green', label: 'Verde' },
]

function Modal({ children }) {
  return createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      {children}
    </div>,
    document.body,
  )
}

export function DashboardLayout({ summaryActions, cards, fixedExpenses }) {
  const [cardsState, setCardsState] = useState(() => cards.map((card) => ({ ...card })))
  const [expenses, setExpenses] = useState(() => [
    ...fixedExpenses.map((expense, index) => ({ ...expense, id: `initial-${index}` })),
    ...cards.map((card) => ({
      id: `card-bill-${card.id}`,
      name: `Fatura - ${card.brand}`,
      paid: false,
      amount: card.spent,
      cardId: card.id,
    })),
  ])
  const [activeView, setActiveView] = useState('overview')
  const [loggedOut, setLoggedOut] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [addingExpense, setAddingExpense] = useState(false)
  const [newExpenseName, setNewExpenseName] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState('')
  const [editingExpense, setEditingExpense] = useState(null)
  const [editExpenseDraft, setEditExpenseDraft] = useState('')
  const [editExpenseAmountDraft, setEditExpenseAmountDraft] = useState('')
  const [showingDetails, setShowingDetails] = useState(false)
  const [heroMode, setHeroMode] = useState('geral')
  const [totalValue, setTotalValue] = useState(1913.7)
  const [editingTotal, setEditingTotal] = useState(false)
  const [totalDraft, setTotalDraft] = useState('')
  const [customWidgets, setCustomWidgets] = useState([])
  const [addingWidget, setAddingWidget] = useState(false)
  const [newWidgetTitle, setNewWidgetTitle] = useState('')
  const [newWidgetDescription, setNewWidgetDescription] = useState('')
  const [addingCard, setAddingCard] = useState(false)
  const [newCardBrand, setNewCardBrand] = useState('')
  const [newCardNetwork, setNewCardNetwork] = useState('')
  const [newCardLastDigits, setNewCardLastDigits] = useState('')
  const [newCardLimit, setNewCardLimit] = useState('')
  const [newCardSpent, setNewCardSpent] = useState('')
  const [newCardColor, setNewCardColor] = useState('card-dark')

  function toggleExpense(id) {
    const target = expenses.find((expense) => expense.id === id)
    if (!target) return

    const nextPaid = !target.paid
    const amount = target.amount || 0

    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.id === id ? { ...expense, paid: nextPaid } : expense,
      ),
    )
    setTotalValue((currentTotal) => (nextPaid ? currentTotal - amount : currentTotal + amount))

    if (target.cardId) {
      setCardsState((currentCards) =>
        currentCards.map((card) =>
          card.id === target.cardId ? { ...card, spent: nextPaid ? 0 : amount } : card,
        ),
      )
    }
  }

  function deleteExpense(id) {
    const target = expenses.find((expense) => expense.id === id)

    setExpenses((currentExpenses) => currentExpenses.filter((expense) => expense.id !== id))

    if (target?.paid) {
      setTotalValue((currentTotal) => currentTotal + (target.amount || 0))

      if (target.cardId) {
        setCardsState((currentCards) =>
          currentCards.map((card) =>
            card.id === target.cardId ? { ...card, spent: target.amount || 0 } : card,
          ),
        )
      }
    }
  }

  function handleAddCard(event) {
    event.preventDefault()
    const brand = newCardBrand.trim()
    const network = newCardNetwork.trim()
    const lastDigits = newCardLastDigits.trim()
    if (!brand || !network || lastDigits.length !== 4) return

    const limit = Number(newCardLimit) || 0
    const spent = Number(newCardSpent) || 0
    const id = `card-${Date.now()}`
    const holder = cardsState[0]?.holder || 'TITULAR DO CARTAO'

    setCardsState((current) => [
      ...current,
      { id, brand: brand.toUpperCase(), network, holder, lastDigits, bgClass: newCardColor, limit, spent },
    ])
    setExpenses((current) => [
      ...current,
      {
        id: `card-bill-${id}`,
        name: `Fatura - ${brand.toUpperCase()}`,
        paid: false,
        amount: spent,
        cardId: id,
      },
    ])

    setNewCardBrand('')
    setNewCardNetwork('')
    setNewCardLastDigits('')
    setNewCardLimit('')
    setNewCardSpent('')
    setNewCardColor('card-dark')
    setAddingCard(false)
  }

  function deleteCard(id) {
    const linkedExpense = expenses.find((expense) => expense.cardId === id)

    setCardsState((current) => current.filter((card) => card.id !== id))
    setExpenses((current) => current.filter((expense) => expense.cardId !== id))

    if (linkedExpense?.paid) {
      setTotalValue((currentTotal) => currentTotal + (linkedExpense.amount || 0))
    }
  }

  function handleAddExpense(event) {
    event.preventDefault()
    const name = newExpenseName.trim()
    if (!name) return

    setExpenses((currentExpenses) => [
      ...currentExpenses,
      { id: `expense-${Date.now()}`, name, paid: false, amount: Number(newExpenseAmount) || 0 },
    ])
    setNewExpenseName('')
    setNewExpenseAmount('')
    setAddingExpense(false)
  }

  function handleOpenEditExpense(expense) {
    setEditingExpense(expense)
    setEditExpenseDraft(expense.name)
    setEditExpenseAmountDraft(String(expense.amount ?? ''))
  }

  function handleSaveExpenseName(event) {
    event.preventDefault()
    const name = editExpenseDraft.trim()
    if (!name) return

    const amount = Number(editExpenseAmountDraft) || 0
    const previousAmount = editingExpense.amount || 0

    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.id === editingExpense.id ? { ...expense, name, amount } : expense,
      ),
    )

    if (editingExpense.paid && amount !== previousAmount) {
      setTotalValue((currentTotal) => currentTotal - (amount - previousAmount))
    }

    setEditingExpense(null)
    setEditExpenseDraft('')
    setEditExpenseAmountDraft('')
  }

  function handleSummaryAction(actionId) {
    if (actionId === 'add') setAddingWidget(true)
    else if (actionId === 'expenses') setHeroMode('expenses')
    else if (actionId === 'cards') setHeroMode('cards')
    else if (actionId === 'total') setHeroMode('geral')
    else if (actionId === 'details') setShowingDetails(true)
  }

  function handleAddWidget(event) {
    event.preventDefault()
    const title = newWidgetTitle.trim()
    if (!title) return

    setCustomWidgets((current) => [
      ...current,
      { id: `widget-${Date.now()}`, title, description: newWidgetDescription.trim() },
    ])
    setNewWidgetTitle('')
    setNewWidgetDescription('')
    setAddingWidget(false)
  }

  function handleRemoveWidget(id) {
    setCustomWidgets((current) => current.filter((widget) => widget.id !== id))
  }

  function handleLoginAgain() {
    setLoggedOut(false)
    setActiveView('overview')
  }

  function handleOpenEditTotal() {
    setTotalDraft(String(totalValue))
    setEditingTotal(true)
  }

  function handleSaveTotal(event) {
    event.preventDefault()
    const value = Number(totalDraft)
    if (Number.isNaN(value) || value < 0) return

    setTotalValue(value)
    setEditingTotal(false)
  }

  const paidCount = expenses.filter((expense) => expense.paid).length
  const pendingCount = expenses.length - paidCount

  const expensesTotal = expenses
    .filter((expense) => !expense.paid)
    .reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const cardsTotal = cardsState.reduce((sum, card) => sum + card.spent, 0)

  const heroValue =
    heroMode === 'expenses' ? expensesTotal : heroMode === 'cards' ? cardsTotal : totalValue
  const heroLabel =
    heroMode === 'expenses'
      ? 'GASTOS EM DESPESAS FIXAS'
      : heroMode === 'cards'
        ? 'GASTOS EM CARTOES'
        : 'VALOR TOTAL DE GASTOS'

  return (
    <div className="app-shell">
      <div className="scene-background" aria-hidden="true">
        <div className="scene-orb orb-one" />
        <div className="scene-orb orb-two" />
        <div className="scene-orb orb-three" />
        <div className="scene-grid" />
        <div className="scene-plane plane-one" />
        <div className="scene-plane plane-two" />
      </div>

      <SidebarMenu
        activeView={activeView}
        onNavigate={setActiveView}
        onLogout={() => setConfirmingLogout(true)}
      />

      {confirmingLogout && (
        <Modal>
          <div className="modal-card">
            <h2>Sair da sua conta?</h2>
            <p>Voce podera entrar novamente quando quiser.</p>
            <div className="modal-actions">
              <button
                className="pill-button"
                type="button"
                onClick={() => setConfirmingLogout(false)}
              >
                Cancelar
              </button>
              <button
                className="pill-button pill-button-danger"
                type="button"
                onClick={() => {
                  setLoggedOut(true)
                  setConfirmingLogout(false)
                }}
              >
                Sim, sair
              </button>
            </div>
          </div>
        </Modal>
      )}

      {addingExpense && (
        <Modal>
          <div className="modal-card modal-card-wide">
            <h2>Nova despesa fixa</h2>
            <p>Adicione uma conta para acompanhar o pagamento.</p>
            <form onSubmit={handleAddExpense}>
              <input
                className="modal-input"
                type="text"
                placeholder="Ex: Streaming"
                value={newExpenseName}
                onChange={(event) => setNewExpenseName(event.target.value)}
                autoFocus
              />
              <input
                className="modal-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor (R$)"
                value={newExpenseAmount}
                onChange={(event) => setNewExpenseAmount(event.target.value)}
              />
              <div className="modal-actions">
                <button
                  className="pill-button"
                  type="button"
                  onClick={() => {
                    setAddingExpense(false)
                    setNewExpenseName('')
                    setNewExpenseAmount('')
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="pill-button pill-button-primary"
                  type="submit"
                  disabled={!newExpenseName.trim()}
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {editingExpense && (
        <Modal>
          <div className="modal-card modal-card-wide">
            <h2>Editar despesa</h2>
            <p>Altere o nome e o valor desta despesa fixa.</p>
            <form onSubmit={handleSaveExpenseName}>
              <input
                className="modal-input"
                type="text"
                value={editExpenseDraft}
                onChange={(event) => setEditExpenseDraft(event.target.value)}
                autoFocus
              />
              <input
                className="modal-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor (R$)"
                value={editExpenseAmountDraft}
                onChange={(event) => setEditExpenseAmountDraft(event.target.value)}
              />
              <div className="modal-actions">
                <button
                  className="pill-button"
                  type="button"
                  onClick={() => {
                    setEditingExpense(null)
                    setEditExpenseDraft('')
                    setEditExpenseAmountDraft('')
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="pill-button pill-button-primary"
                  type="submit"
                  disabled={!editExpenseDraft.trim()}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {addingWidget && (
        <Modal>
          <div className="modal-card modal-card-wide">
            <h2>Novo card</h2>
            <p>Crie um card personalizado para o seu dashboard.</p>
            <form onSubmit={handleAddWidget}>
              <input
                className="modal-input"
                type="text"
                placeholder="Titulo (ex: Metas do mes)"
                value={newWidgetTitle}
                onChange={(event) => setNewWidgetTitle(event.target.value)}
                autoFocus
              />
              <textarea
                className="modal-input modal-textarea"
                placeholder="Descricao (opcional)"
                value={newWidgetDescription}
                onChange={(event) => setNewWidgetDescription(event.target.value)}
              />
              <div className="modal-actions">
                <button
                  className="pill-button"
                  type="button"
                  onClick={() => {
                    setAddingWidget(false)
                    setNewWidgetTitle('')
                    setNewWidgetDescription('')
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="pill-button pill-button-primary"
                  type="submit"
                  disabled={!newWidgetTitle.trim()}
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {addingCard && (
        <Modal>
          <div className="modal-card modal-card-wide">
            <h2>Novo cartao</h2>
            <p>Cadastre um cartao para acompanhar limite e gastos.</p>
            <form onSubmit={handleAddCard}>
              <input
                className="modal-input"
                type="text"
                placeholder="Nome do cartao (ex: Nubank)"
                value={newCardBrand}
                onChange={(event) => setNewCardBrand(event.target.value)}
                autoFocus
              />
              <input
                className="modal-input"
                type="text"
                placeholder="Bandeira (ex: Visa, Mastercard)"
                value={newCardNetwork}
                onChange={(event) => setNewCardNetwork(event.target.value)}
              />
              <input
                className="modal-input"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="Ultimos 4 digitos"
                value={newCardLastDigits}
                onChange={(event) =>
                  setNewCardLastDigits(event.target.value.replace(/\D/g, '').slice(0, 4))
                }
              />
              <input
                className="modal-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Limite total (R$)"
                value={newCardLimit}
                onChange={(event) => setNewCardLimit(event.target.value)}
              />
              <input
                className="modal-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor gasto atual (opcional)"
                value={newCardSpent}
                onChange={(event) => setNewCardSpent(event.target.value)}
              />
              <div className="color-swatch-row">
                {CARD_COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`color-swatch ${option.value} ${
                      newCardColor === option.value ? 'selected' : ''
                    }`}
                    aria-label={option.label}
                    onClick={() => setNewCardColor(option.value)}
                  />
                ))}
              </div>
              <div className="modal-actions">
                <button
                  className="pill-button"
                  type="button"
                  onClick={() => {
                    setAddingCard(false)
                    setNewCardBrand('')
                    setNewCardNetwork('')
                    setNewCardLastDigits('')
                    setNewCardLimit('')
                    setNewCardSpent('')
                    setNewCardColor('card-dark')
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="pill-button pill-button-primary"
                  type="submit"
                  disabled={
                    !newCardBrand.trim() || !newCardNetwork.trim() || newCardLastDigits.length !== 4
                  }
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {editingTotal && (
        <Modal>
          <div className="modal-card modal-card-wide">
            <h2>Editar valor total</h2>
            <p>Atualize o valor total de gastos exibido no resumo.</p>
            <form onSubmit={handleSaveTotal}>
              <input
                className="modal-input"
                type="number"
                step="0.01"
                min="0"
                value={totalDraft}
                onChange={(event) => setTotalDraft(event.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                <button
                  className="pill-button"
                  type="button"
                  onClick={() => setEditingTotal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="pill-button pill-button-primary"
                  type="submit"
                  disabled={totalDraft.trim() === '' || Number(totalDraft) < 0}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {showingDetails && (
        <Modal>
          <div className="modal-card modal-card-wide">
            <h2>Detalhes financeiros</h2>
            <div className="details-grid">
              <div className="detail-card">
                <span>Valor total de gastos</span>
                <strong>{formatCurrency(totalValue)}</strong>
              </div>
              <div className="detail-card">
                <span>Limite total dos cartoes</span>
                <strong>R$ 6.600,00</strong>
              </div>
              <div className="detail-card">
                <span>Cartoes cadastrados</span>
                <strong>{cardsState.length}</strong>
              </div>
              <div className="detail-card">
                <span>Despesas fixas pagas</span>
                <strong>{paidCount}</strong>
              </div>
              <div className="detail-card detail-card-wide">
                <span>Despesas fixas pendentes</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="pill-button"
                type="button"
                onClick={() => setShowingDetails(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      <main className="dashboard">
        {loggedOut ? (
          <section className="panel logout-screen">
            <h2>Voce saiu da sua conta</h2>
            <p>Ate breve! Clique abaixo para entrar novamente.</p>
            <button className="pill-button" type="button" onClick={handleLoginAgain}>
              Entrar novamente
            </button>
          </section>
        ) : (
          <>
            {activeView === 'overview' && (
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
                        onClick={handleOpenEditTotal}
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
                        onClick={() => handleSummaryAction(action.id)}
                      >
                        <ActionIcon type={action.icon} />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <CardsPanel
                  cards={cardsState}
                  onAddCard={() => setAddingCard(true)}
                  onDeleteCard={deleteCard}
                />

                <section className="widgets-grid">
                  <ExpensesPanel
                    expenses={expenses}
                    onToggle={toggleExpense}
                    onAddClick={() => setAddingExpense(true)}
                    onEdit={handleOpenEditExpense}
                    onDelete={deleteExpense}
                  />

                  <article className="panel widget">
                    <div className="widget-header">
                      <h3>Atividade 2</h3>
                      <span className="widget-icon aqua">
                        <WalletIcon />
                      </span>
                    </div>

                    <p>
                      Controle de pagamentos pendentes e agendamentos futuros.
                    </p>
                  </article>

                  <article className="panel widget">
                    <div className="widget-header">
                      <h3>Atividade 3</h3>
                      <span className="widget-icon green">
                        <TrendIcon />
                      </span>
                    </div>

                    <p>
                      Analise de metas de economia e projecoes para o proximo mes.
                    </p>
                  </article>

                  {customWidgets.map((widget) => (
                    <article className="panel widget" key={widget.id}>
                      <div className="widget-header">
                        <h3>{widget.title}</h3>
                        <button
                          className="icon-button"
                          type="button"
                          aria-label={`Remover card ${widget.title}`}
                          onClick={() => handleRemoveWidget(widget.id)}
                        >
                          <CloseIcon />
                        </button>
                      </div>

                      {widget.description && <p>{widget.description}</p>}
                    </article>
                  ))}
                </section>
              </>
            )}

            {activeView === 'cards' && (
              <CardsPanel
                cards={cardsState}
                onAddCard={() => setAddingCard(true)}
                onDeleteCard={deleteCard}
                standalone
              />
            )}

            {activeView === 'expenses' && (
              <ExpensesPanel
                expenses={expenses}
                onToggle={toggleExpense}
                onAddClick={() => setAddingExpense(true)}
                onEdit={handleOpenEditExpense}
                onDelete={deleteExpense}
                standalone
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

function ExpensesPanel({ expenses, onToggle, onAddClick, onEdit, onDelete, standalone }) {
  const list = (
    <ul className={`expense-list ${standalone ? 'expense-list-standalone' : ''}`}>
      {expenses.map((expense) => (
        <li key={expense.id}>
          <label>
            <input
              type="checkbox"
              checked={expense.paid}
              onChange={() => onToggle(expense.id)}
            />
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

function ContactlessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="contactless-icon" aria-hidden="true">
      <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <path d="M9 8.5a6 6 0 0 1 0 7" />
      <path d="M12.5 6a9.5 9.5 0 0 1 0 12" />
      <path d="M16 4a13 13 0 0 1 0 16" />
    </svg>
  )
}

function CreditCardFace({ card }) {
  return (
    <>
      <div className="credit-card-top">
        <div className="card-chip-wrap">
          <span className="card-chip" />
          <ContactlessIcon />
        </div>
        <div className="card-brand">
          <span className="card-network">{card.network}</span>
          <strong>{card.brand}</strong>
        </div>
      </div>

      <div className="credit-card-number">**** **** **** {card.lastDigits}</div>

      <div className="credit-card-meta">
        <span className="card-label">CARD HOLDER</span>
        <span className="card-label">VALID THRU</span>
      </div>

      <div className="credit-card-footer">
        <span>{card.holder}</span>
        <div className="card-footer-right">
          <span>12/29</span>
          <span className="mini-chip" />
        </div>
      </div>
    </>
  )
}

function CardsPanel({ cards, onAddCard, onDeleteCard, standalone }) {
  const [selectedCard, setSelectedCard] = useState(null)

  const usedPercent = selectedCard
    ? Math.min(100, Math.round((selectedCard.spent / selectedCard.limit) * 100))
    : 0

  function handleDelete() {
    onDeleteCard(selectedCard.id)
    setSelectedCard(null)
  }

  const cardFacePreview = selectedCard && (
    <div
      className={`credit-card ${selectedCard.bgClass} ${
        standalone ? 'card-detail-face' : 'modal-card-preview'
      }`}
    >
      <CreditCardFace card={selectedCard} />
    </div>
  )

  const cardDetailInfo = selectedCard && (
    <div className="card-detail-info">
      <ul className="details-list">
        <li>
          <span>Valor gasto atual</span>
          <strong>{formatCurrency(selectedCard.spent)}</strong>
        </li>
        <li>
          <span>Limite disponivel</span>
          <strong>{formatCurrency(selectedCard.limit - selectedCard.spent)}</strong>
        </li>
        <li>
          <span>Limite total</span>
          <strong>{formatCurrency(selectedCard.limit)}</strong>
        </li>
      </ul>

      <div className="limit-progress" aria-hidden="true">
        <span className="limit-progress-fill" style={{ width: `${usedPercent}%` }} />
      </div>

      <div className="modal-actions">
        <button className="pill-button" type="button" onClick={() => setSelectedCard(null)}>
          {standalone ? 'Fechar detalhes' : 'Fechar'}
        </button>
        <button className="pill-button pill-button-danger" type="button" onClick={handleDelete}>
          Excluir cartao
        </button>
      </div>
    </div>
  )

  return (
    <>
      <section className="panel cards-panel">
        <div className="panel-heading">
          <div>
            <h2>Meus Cartoes</h2>
            <p>Gerencie seus limites e visualize seus gastos recorrentes.</p>
          </div>

          <div className="limit-box">
            <div className="limit-summary">
              <span>Limite Total</span>
              <strong>R$ 6.600,00</strong>
            </div>
            <div className="limit-progress" aria-hidden="true">
              <span className="limit-progress-fill" />
            </div>
          </div>
        </div>

        <div className="cards-grid">
          {cards.map((card) => (
            <article
              className={`credit-card ${card.bgClass}`}
              key={card.id}
              role="button"
              tabIndex={0}
              aria-label={`Ver detalhes do cartao ${card.brand}`}
              onClick={() => setSelectedCard(card)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedCard(card)
                }
              }}
            >
              <CreditCardFace card={card} />
            </article>
          ))}

          <button
            className="add-card-tile"
            type="button"
            aria-label="Adicionar novo cartao"
            onClick={onAddCard}
          >
            <span className="add-card-icon">
              <PlusIcon />
            </span>
          </button>
        </div>

        {selectedCard && !standalone && (
          <Modal>
            <div className="modal-card modal-card-wide modal-card-cardface">
              {cardFacePreview}
              {cardDetailInfo}
            </div>
          </Modal>
        )}
      </section>

      {selectedCard && standalone && (
        <section className="panel cards-panel">
          <div className="card-detail-panel">
            {cardFacePreview}
            {cardDetailInfo}
          </div>
        </section>
      )}
    </>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="m5 19 3.2-.6L18 8.6 15.4 6 5.6 15.8 5 19Z" />
      <path d="m13.9 7.4 2.7 2.7" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5H18v14H7.5A2.5 2.5 0 0 1 5 16.5v-9Z" />
      <path d="M18 9h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2" />
      <circle cx="16.5" cy="12" r="1" />
    </svg>
  )
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M5 17 10 12l3 3 6-7" />
      <path d="M16 8h3v3" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function DetailsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 10v4" />
      <path d="M12 7.5h.01" />
    </svg>
  )
}

function ActionIcon({ type }) {
  if (type === 'plus') return <PlusIcon />
  if (type === 'wallet') return <WalletIcon />
  if (type === 'card') return <CardTinyIcon />
  if (type === 'sum') return <SumIcon />
  return <DetailsIcon />
}

function SumIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M6 5h11l-6 7 6 7H6" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  )
}

function TrashIcon() {
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

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function CardTinyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <rect x="4" y="6.5" width="16" height="11" rx="2" />
      <path d="M4 10.5h16" />
    </svg>
  )
}
