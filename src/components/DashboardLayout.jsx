import { useState } from 'react'
import { SidebarMenu } from './SidebarMenu'
import { LogoutModal } from './modals/LogoutModal'
import { AddExpenseModal } from './modals/AddExpenseModal'
import { EditExpenseModal } from './modals/EditExpenseModal'
import { AddWidgetModal } from './modals/AddWidgetModal'
import { AddCardModal } from './modals/AddCardModal'
import { EditTotalModal } from './modals/EditTotalModal'
import { DetailsModal } from './modals/DetailsModal'
import { OverviewPage } from '../pages/OverviewPage'
import { CardsPage } from '../pages/CardsPage'
import { ExpensesPage } from '../pages/ExpensesPage'

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
        <LogoutModal
          onCancel={() => setConfirmingLogout(false)}
          onConfirm={() => {
            setLoggedOut(true)
            setConfirmingLogout(false)
          }}
        />
      )}

      {addingExpense && (
        <AddExpenseModal
          name={newExpenseName}
          amount={newExpenseAmount}
          onNameChange={setNewExpenseName}
          onAmountChange={setNewExpenseAmount}
          onCancel={() => {
            setAddingExpense(false)
            setNewExpenseName('')
            setNewExpenseAmount('')
          }}
          onSubmit={handleAddExpense}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          name={editExpenseDraft}
          amount={editExpenseAmountDraft}
          onNameChange={setEditExpenseDraft}
          onAmountChange={setEditExpenseAmountDraft}
          onCancel={() => {
            setEditingExpense(null)
            setEditExpenseDraft('')
            setEditExpenseAmountDraft('')
          }}
          onSubmit={handleSaveExpenseName}
        />
      )}

      {addingWidget && (
        <AddWidgetModal
          title={newWidgetTitle}
          description={newWidgetDescription}
          onTitleChange={setNewWidgetTitle}
          onDescriptionChange={setNewWidgetDescription}
          onCancel={() => {
            setAddingWidget(false)
            setNewWidgetTitle('')
            setNewWidgetDescription('')
          }}
          onSubmit={handleAddWidget}
        />
      )}

      {addingCard && (
        <AddCardModal
          brand={newCardBrand}
          network={newCardNetwork}
          lastDigits={newCardLastDigits}
          limit={newCardLimit}
          spent={newCardSpent}
          color={newCardColor}
          onBrandChange={setNewCardBrand}
          onNetworkChange={setNewCardNetwork}
          onLastDigitsChange={setNewCardLastDigits}
          onLimitChange={setNewCardLimit}
          onSpentChange={setNewCardSpent}
          onColorChange={setNewCardColor}
          onCancel={() => {
            setAddingCard(false)
            setNewCardBrand('')
            setNewCardNetwork('')
            setNewCardLastDigits('')
            setNewCardLimit('')
            setNewCardSpent('')
            setNewCardColor('card-dark')
          }}
          onSubmit={handleAddCard}
        />
      )}

      {editingTotal && (
        <EditTotalModal
          value={totalDraft}
          onChange={setTotalDraft}
          onCancel={() => setEditingTotal(false)}
          onSubmit={handleSaveTotal}
        />
      )}

      {showingDetails && (
        <DetailsModal
          totalValue={totalValue}
          cardsCount={cardsState.length}
          paidCount={paidCount}
          pendingCount={pendingCount}
          onClose={() => setShowingDetails(false)}
        />
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
              <OverviewPage
                summaryActions={summaryActions}
                heroLabel={heroLabel}
                heroValue={heroValue}
                heroMode={heroMode}
                onEditTotal={handleOpenEditTotal}
                onSummaryAction={handleSummaryAction}
                cardsState={cardsState}
                onAddCard={() => setAddingCard(true)}
                onDeleteCard={deleteCard}
                expenses={expenses}
                onToggleExpense={toggleExpense}
                onAddExpenseClick={() => setAddingExpense(true)}
                onEditExpense={handleOpenEditExpense}
                onDeleteExpense={deleteExpense}
                customWidgets={customWidgets}
                onRemoveWidget={handleRemoveWidget}
              />
            )}

            {activeView === 'cards' && (
              <CardsPage
                cardsState={cardsState}
                onAddCard={() => setAddingCard(true)}
                onDeleteCard={deleteCard}
              />
            )}

            {activeView === 'expenses' && (
              <ExpensesPage
                expenses={expenses}
                onToggleExpense={toggleExpense}
                onAddExpenseClick={() => setAddingExpense(true)}
                onEditExpense={handleOpenEditExpense}
                onDeleteExpense={deleteExpense}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
