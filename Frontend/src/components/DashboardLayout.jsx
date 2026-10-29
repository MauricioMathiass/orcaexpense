import { useMemo, useState } from 'react'
import { useAutoSave } from '../utils/useAutoSave'
import { parseMoney, roundMoney } from '../utils/money'
import {
  getPaidInstallments,
  isInstallmentPurchase,
  normalizeReceivable,
  normalizeReceivables,
} from '../utils/receivables'
import { SidebarMenu } from './SidebarMenu'
import { LogoutModal } from './modals/LogoutModal'
import { ResetContentModal } from './modals/ResetContentModal'
import { AddExpenseModal } from './modals/AddExpenseModal'
import { EditExpenseModal } from './modals/EditExpenseModal'
import { AddWidgetModal } from './modals/AddWidgetModal'
import { AddCardModal } from './modals/AddCardModal'
import { DetailsModal } from './modals/DetailsModal'
import { AddChecklistItemModal } from './modals/AddChecklistItemModal'
import { EditChecklistItemModal } from './modals/EditChecklistItemModal'
import { OverviewPage } from '../pages/OverviewPage'
import { CardsPage } from '../pages/CardsPage'
import { ExpensesPage } from '../pages/ExpensesPage'
import { ThirdPartyPage } from '../pages/ThirdPartyPage'
import { ReportsPage } from '../pages/ReportsPage'
import { ReceivableModal } from './modals/ReceivableModal'
import { EditCardModal } from './modals/EditCardModal'

const receivableModalTexts = {
  add: {
    title: 'Novo valor a cobrar',
    description: () => 'Cadastre um valor que um terceiro deve a você.',
    submitLabel: 'Adicionar',
    namePlaceholder: 'Nome (ex: João)',
    nameRequired: true,
  },
  edit: {
    title: 'Editar valor',
    description: () => 'Altere o nome e o valor a ser cobrado.',
    submitLabel: 'Salvar',
    namePlaceholder: 'Nome (ex: João)',
    nameRequired: true,
  },
  'add-purchase': {
    title: 'Nova compra',
    description: (owner) => `Adicione outra compra no nome de ${owner}.`,
    submitLabel: 'Adicionar',
    namePlaceholder: 'Descrição da compra (opcional)',
    nameRequired: false,
  },
  'edit-purchase': {
    title: 'Editar compra',
    description: (owner) => `Altere os dados da compra de ${owner}.`,
    submitLabel: 'Salvar',
    namePlaceholder: 'Descrição da compra (opcional)',
    nameRequired: false,
  },
}

export function DashboardLayout({ summaryActions, initialData, onSignOut }) {
  const [cardsState, setCardsState] = useState(initialData.cards)
  const [expenses, setExpenses] = useState(initialData.expenses)
  const [activeView, setActiveView] = useState('overview')
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [addingExpense, setAddingExpense] = useState(false)
  const [newExpenseName, setNewExpenseName] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState('')
  const [editingExpense, setEditingExpense] = useState(null)
  const [editExpenseDraft, setEditExpenseDraft] = useState('')
  const [editExpenseAmountDraft, setEditExpenseAmountDraft] = useState('')
  const [showingDetails, setShowingDetails] = useState(false)
  const [heroMode, setHeroMode] = useState('expenses')
  const [customWidgets, setCustomWidgets] = useState(initialData.customWidgets)
  const [storedReceivables, setReceivables] = useState(initialData.receivables)
  const { status: saveStatus, flush: saveNow } = useAutoSave({
    cards: cardsState,
    expenses,
    receivables: storedReceivables,
    customWidgets,
  })
  const receivables = useMemo(() => normalizeReceivables(storedReceivables), [storedReceivables])
  const [receivableForm, setReceivableForm] = useState(null)
  const [receivableName, setReceivableName] = useState('')
  const [receivableAmount, setReceivableAmount] = useState('')
  const [receivableInstallment, setReceivableInstallment] = useState(false)
  const [receivableInstallments, setReceivableInstallments] = useState('')
  const [receivableInstallmentAmount, setReceivableInstallmentAmount] = useState('')
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
  const [editingCardId, setEditingCardId] = useState(null)
  const [editCardBrand, setEditCardBrand] = useState('')
  const [editCardNetwork, setEditCardNetwork] = useState('')
  const [editCardLastDigits, setEditCardLastDigits] = useState('')
  const [editCardHolder, setEditCardHolder] = useState('')
  const [editCardColor, setEditCardColor] = useState('card-dark')
  const [addingChecklistItem, setAddingChecklistItem] = useState(null)
  const [pickingChecklistCard, setPickingChecklistCard] = useState(false)
  const [newChecklistItemName, setNewChecklistItemName] = useState('')
  const [newChecklistItemAmount, setNewChecklistItemAmount] = useState('')
  const [newChecklistItemInstallment, setNewChecklistItemInstallment] = useState(false)
  const [newChecklistItemInstallments, setNewChecklistItemInstallments] = useState('')
  const [newChecklistItemInstallmentAmount, setNewChecklistItemInstallmentAmount] = useState('')
  const [editingChecklistItem, setEditingChecklistItem] = useState(null)
  const [editChecklistItemDraft, setEditChecklistItemDraft] = useState('')
  const [editChecklistItemAmountDraft, setEditChecklistItemAmountDraft] = useState('')
  const [editChecklistItemInstallmentDraft, setEditChecklistItemInstallmentDraft] = useState(false)
  const [editChecklistItemInstallmentsDraft, setEditChecklistItemInstallmentsDraft] = useState('')
  const [editChecklistItemInstallmentAmountDraft, setEditChecklistItemInstallmentAmountDraft] =
    useState('')

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

    if (target.cardId) {
      setCardsState((currentCards) =>
        currentCards.map((card) =>
          card.id === target.cardId
            ? {
                ...card,
                spent: nextPaid ? 0 : amount,
                checklist: (card.checklist || []).map((item) => ({ ...item, settled: nextPaid })),
              }
            : card,
        ),
      )
    }
  }

  function deleteExpense(id) {
    setExpenses((currentExpenses) => currentExpenses.filter((expense) => expense.id !== id))
  }

  function handleAddCard(event) {
    event.preventDefault()
    const brand = newCardBrand.trim()
    const network = newCardNetwork.trim()
    const lastDigits = newCardLastDigits.trim()
    if (!brand || !network || lastDigits.length !== 4) return

    const limit = parseMoney(newCardLimit)
    const spent = parseMoney(newCardSpent)
    const id = `card-${Date.now()}`
    const holder = cardsState[0]?.holder || 'TITULAR DO CARTÃO'

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

  function handleOpenEditCard(card) {
    setEditingCardId(card.id)
    setEditCardBrand(card.brand)
    setEditCardNetwork(card.network)
    setEditCardLastDigits(card.lastDigits)
    setEditCardHolder(card.holder)
    setEditCardColor(card.bgClass)
  }

  function handleCloseEditCard() {
    setEditingCardId(null)
  }

  function handleSaveCard(event) {
    event.preventDefault()
    const brand = editCardBrand.trim().toUpperCase()
    const network = editCardNetwork.trim()
    const holder = editCardHolder.trim().toUpperCase()
    if (!brand || !network || !holder || editCardLastDigits.length !== 4) return

    setCardsState((current) =>
      current.map((card) =>
        card.id === editingCardId
          ? { ...card, brand, network, holder, lastDigits: editCardLastDigits, bgClass: editCardColor }
          : card,
      ),
    )
    setExpenses((current) =>
      current.map((expense) =>
        expense.cardId === editingCardId ? { ...expense, name: `Fatura - ${brand}` } : expense,
      ),
    )
    handleCloseEditCard()
  }

  function syncCardBillAmount(cardId, delta) {
    if (!delta) return
    setExpenses((current) =>
      current.map((expense) =>
        expense.cardId === cardId && !expense.paid
          ? { ...expense, amount: roundMoney(Math.max(0, (expense.amount || 0) + delta)) }
          : expense,
      ),
    )
  }

  function handleAddChecklistItem(event) {
    event.preventDefault()
    const name = newChecklistItemName.trim()
    if (!name) return

    const cardId = addingChecklistItem
    const installments = newChecklistItemInstallment
      ? Math.max(2, Number(newChecklistItemInstallments) || 2)
      : undefined
    const amount = newChecklistItemInstallment
      ? roundMoney(installments * parseMoney(newChecklistItemInstallmentAmount))
      : parseMoney(newChecklistItemAmount)
    const billIsPaid = expenses.some((expense) => expense.cardId === cardId && expense.paid)

    setCardsState((current) =>
      current.map((card) =>
        card.id === cardId
          ? {
              ...card,
              spent: billIsPaid ? amount : roundMoney(card.spent + amount),
              checklist: [
                ...(card.checklist || []),
                {
                  id: `item-${Date.now()}`,
                  name,
                  amount,
                  installment: newChecklistItemInstallment,
                  installments,
                },
              ],
            }
          : card,
      ),
    )
    if (billIsPaid) {
      setExpenses((current) =>
        current.map((expense) =>
          expense.cardId === cardId ? { ...expense, paid: false, amount } : expense,
        ),
      )
    } else {
      syncCardBillAmount(cardId, amount)
    }
    setNewChecklistItemName('')
    setNewChecklistItemAmount('')
    setNewChecklistItemInstallment(false)
    setNewChecklistItemInstallments('')
    setNewChecklistItemInstallmentAmount('')
    setPickingChecklistCard(false)
    setAddingChecklistItem(null)
  }

  function handleOpenAddInstallment() {
    if (cardsState.length === 0) return
    setNewChecklistItemInstallment(true)
    setPickingChecklistCard(true)
    setAddingChecklistItem(cardsState[0].id)
  }

  function deleteChecklistItem(cardId, itemId) {
    const target = cardsState
      .find((card) => card.id === cardId)
      ?.checklist?.find((item) => item.id === itemId)

    const delta = target?.settled ? 0 : -(target?.amount || 0)

    setCardsState((current) =>
      current.map((card) =>
        card.id === cardId
          ? {
              ...card,
              spent: roundMoney(Math.max(0, card.spent + delta)),
              checklist: (card.checklist || []).filter((item) => item.id !== itemId),
            }
          : card,
      ),
    )
    syncCardBillAmount(cardId, delta)
  }

  function handleOpenEditChecklistItem(cardId, item) {
    setEditingChecklistItem({ cardId, itemId: item.id })
    setEditChecklistItemDraft(item.name)
    setEditChecklistItemAmountDraft(String(item.amount ?? ''))
    setEditChecklistItemInstallmentDraft(!!item.installment)
    setEditChecklistItemInstallmentsDraft(String(item.installments ?? ''))
    setEditChecklistItemInstallmentAmountDraft(
      item.installment && item.installments
        ? String(item.amount / item.installments)
        : '',
    )
  }

  function handleSaveChecklistItem(event) {
    event.preventDefault()
    const name = editChecklistItemDraft.trim()
    if (!name) return

    const { cardId, itemId } = editingChecklistItem
    const installments = editChecklistItemInstallmentDraft
      ? Math.max(2, Number(editChecklistItemInstallmentsDraft) || 2)
      : undefined
    const amount = editChecklistItemInstallmentDraft
      ? roundMoney(installments * parseMoney(editChecklistItemInstallmentAmountDraft))
      : parseMoney(editChecklistItemAmountDraft)
    const previousItem = cardsState
      .find((card) => card.id === cardId)
      ?.checklist?.find((item) => item.id === itemId)
    const delta = previousItem?.settled ? 0 : roundMoney(amount - (previousItem?.amount || 0))

    setCardsState((current) =>
      current.map((card) =>
        card.id === cardId
          ? {
              ...card,
              spent: roundMoney(Math.max(0, card.spent + delta)),
              checklist: (card.checklist || []).map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      name,
                      amount,
                      installment: editChecklistItemInstallmentDraft,
                      installments,
                      paidInstallments: installments
                        ? Math.min(item.paidInstallments || 0, installments)
                        : undefined,
                    }
                  : item,
              ),
            }
          : card,
      ),
    )
    syncCardBillAmount(cardId, delta)
    setEditingChecklistItem(null)
    setEditChecklistItemDraft('')
    setEditChecklistItemAmountDraft('')
    setEditChecklistItemInstallmentDraft(false)
    setEditChecklistItemInstallmentsDraft('')
    setEditChecklistItemInstallmentAmountDraft('')
  }

  function adjustPaidInstallments(cardId, itemId, delta) {
    setCardsState((current) =>
      current.map((card) =>
        card.id === cardId
          ? {
              ...card,
              checklist: (card.checklist || []).map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      paidInstallments: Math.min(
                        item.installments,
                        Math.max(0, (item.paidInstallments || 0) + delta),
                      ),
                    }
                  : item,
              ),
            }
          : card,
      ),
    )
  }

  function deleteCard(id) {
    setCardsState((current) => current.filter((card) => card.id !== id))
    setExpenses((current) => current.filter((expense) => expense.cardId !== id))
  }

  function handleAddExpense(event) {
    event.preventDefault()
    const name = newExpenseName.trim()
    if (!name) return

    setExpenses((currentExpenses) => [
      ...currentExpenses,
      { id: `expense-${Date.now()}`, name, paid: false, amount: parseMoney(newExpenseAmount) },
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

    const amount = parseMoney(editExpenseAmountDraft)
    const previousAmount = editingExpense.amount || 0

    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.id === editingExpense.id ? { ...expense, name, amount } : expense,
      ),
    )

    if (editingExpense.cardId && !editingExpense.paid && amount !== previousAmount) {
      setCardsState((currentCards) =>
        currentCards.map((card) =>
          card.id === editingExpense.cardId
            ? { ...card, spent: roundMoney(Math.max(0, card.spent + (amount - previousAmount))) }
            : card,
        ),
      )
    }

    setEditingExpense(null)
    setEditExpenseDraft('')
    setEditExpenseAmountDraft('')
  }

  function handleSummaryAction(actionId) {
    if (actionId === 'add') setAddingWidget(true)
    else if (actionId === 'expenses') setHeroMode('expenses')
    else if (['cards', 'installments', 'third-party'].includes(actionId))
      setHeroMode((mode) => (mode === actionId ? 'expenses' : actionId))
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

  // Apaga tudo o que o app guarda (os estados persistentes gravam o valor vazio no navegador).
  function handleResetContent() {
    setCardsState([])
    setExpenses([])
    setCustomWidgets([])
    setReceivables([])
    setHeroMode('expenses')
    setShowingDetails(false)
    setConfirmingReset(false)
  }

  function handleRemoveWidget(id) {
    setCustomWidgets((current) => current.filter((widget) => widget.id !== id))
  }

  function closeReceivableForm() {
    setReceivableForm(null)
    setReceivableName('')
    setReceivableAmount('')
    setReceivableInstallment(false)
    setReceivableInstallments('')
    setReceivableInstallmentAmount('')
  }

  function updateReceivables(update) {
    setReceivables((current) => update(normalizeReceivables(current)).map(normalizeReceivable))
  }

  function updatePurchase(receivableId, purchaseId, update) {
    updateReceivables((current) =>
      current.map((item) =>
        item.id !== receivableId
          ? item
          : {
              ...item,
              purchases: item.purchases.map((purchase) =>
                purchase.id === purchaseId ? update(purchase) : purchase,
              ),
            },
      ),
    )
  }

  function fillPurchaseDraft(purchase) {
    setReceivableAmount(String(purchase.amount ?? ''))
    setReceivableInstallment(!!purchase.installment)
    setReceivableInstallments(String(purchase.installments ?? ''))
    setReceivableInstallmentAmount(
      purchase.installment && purchase.installments
        ? String(purchase.amount / purchase.installments)
        : '',
    )
  }

  function handleOpenAddReceivable() {
    setReceivableForm({ mode: 'add' })
  }

  function handleOpenEditReceivable(item) {
    const single = item.purchases.length === 1
    setReceivableForm({ mode: 'edit', id: item.id, nameOnly: !single })
    setReceivableName(item.name)
    if (single) fillPurchaseDraft(item.purchases[0])
  }

  function handleOpenAddReceivablePurchase(item) {
    setReceivableForm({ mode: 'add-purchase', id: item.id, ownerName: item.name })
    setReceivableInstallment(true)
  }

  function handleOpenEditReceivablePurchase(item, purchase) {
    setReceivableForm({
      mode: 'edit-purchase',
      id: item.id,
      purchaseId: purchase.id,
      ownerName: item.name,
    })
    setReceivableName(purchase.label)
    fillPurchaseDraft(purchase)
  }

  // Monta a compra a partir do formulário, preservando as parcelas já pagas ao editar.
  function buildPurchaseFromForm(previous, label) {
    const id = previous?.id ?? `purchase-${Date.now()}`

    if (!receivableInstallment) {
      return {
        id,
        label,
        amount: parseMoney(receivableAmount),
        installment: false,
        received: !!previous?.received,
      }
    }

    const installments = Math.max(2, Number(receivableInstallments) || 2)
    const previousPaid = !previous
      ? 0
      : isInstallmentPurchase(previous)
        ? getPaidInstallments(previous)
        : previous.received
          ? installments
          : 0

    return {
      id,
      label,
      amount: roundMoney(installments * parseMoney(receivableInstallmentAmount)),
      installment: true,
      installments,
      paidInstallments: Math.min(previousPaid, installments),
    }
  }

  function handleSubmitReceivable(event) {
    event.preventDefault()
    const { mode, id, purchaseId, nameOnly } = receivableForm
    const text = receivableName.trim()
    if ((mode === 'add' || mode === 'edit') && !text) return

    if (mode === 'add') {
      const purchase = buildPurchaseFromForm(null, '')
      updateReceivables((current) => [
        ...current,
        { id: `receivable-${Date.now()}`, name: text, purchases: [purchase] },
      ])
    } else if (mode === 'edit') {
      updateReceivables((current) =>
        current.map((item) => {
          if (item.id !== id) return item
          if (nameOnly) return { ...item, name: text }
          return { ...item, name: text, purchases: [buildPurchaseFromForm(item.purchases[0], '')] }
        }),
      )
    } else if (mode === 'add-purchase') {
      const purchase = buildPurchaseFromForm(null, text)
      updateReceivables((current) =>
        current.map((item) =>
          item.id === id ? { ...item, purchases: [...item.purchases, purchase] } : item,
        ),
      )
    } else {
      updatePurchase(id, purchaseId, (purchase) => buildPurchaseFromForm(purchase, text))
    }

    closeReceivableForm()
  }

  function toggleReceivablePurchase(receivableId, purchaseId) {
    updatePurchase(receivableId, purchaseId, (purchase) =>
      isInstallmentPurchase(purchase)
        ? {
            ...purchase,
            paidInstallments: purchase.received ? 0 : purchase.installments,
          }
        : { ...purchase, received: !purchase.received },
    )
  }

  function adjustPaidReceivableInstallments(receivableId, purchaseId, delta) {
    updatePurchase(receivableId, purchaseId, (purchase) =>
      isInstallmentPurchase(purchase)
        ? {
            ...purchase,
            paidInstallments: Math.min(
              Math.max(getPaidInstallments(purchase) + delta, 0),
              purchase.installments,
            ),
          }
        : purchase,
    )
  }

  function deleteReceivablePurchase(receivableId, purchaseId) {
    updateReceivables((current) =>
      current.map((item) =>
        item.id !== receivableId || item.purchases.length < 2
          ? item
          : { ...item, purchases: item.purchases.filter((purchase) => purchase.id !== purchaseId) },
      ),
    )
  }

  function deleteReceivable(id) {
    updateReceivables((current) => current.filter((item) => item.id !== id))
  }

  const paidCount = expenses.filter((expense) => expense.paid).length
  const pendingCount = expenses.length - paidCount

  const expensesTotal = expenses
    .filter((expense) => !expense.paid)
    .reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const cardsTotal = cardsState.reduce((sum, card) => sum + card.spent, 0)
  const cardsLimitTotal = cardsState.reduce((sum, card) => sum + card.limit, 0)

  const installmentsActiveTotal = roundMoney(
    cardsState
      .flatMap((card) => card.checklist || [])
      .filter(
        (item) =>
          item.installment && item.installments > 0 && (item.paidInstallments || 0) < item.installments,
      )
      .reduce((sum, item) => sum + (item.amount || 0), 0),
  )
  const receivablesPendingTotal = roundMoney(
    receivables
      .filter((item) => !item.received)
      .reduce((sum, item) => sum + (item.amount || 0), 0),
  )

  const heroByMode = {
    expenses: { value: expensesTotal, label: 'GASTOS EM DESPESAS FIXAS' },
    cards: { value: cardsTotal, label: 'GASTOS EM CARTÕES' },
    installments: { value: installmentsActiveTotal, label: 'COMPRAS PARCELADAS ATIVAS' },
    'third-party': { value: receivablesPendingTotal, label: 'VALORES A RECEBER DE TERCEIROS' },
  }
  const heroValue = heroByMode[heroMode].value
  const heroLabel = heroByMode[heroMode].label

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

      {saveStatus === 'error' && (
        <p className="save-status" role="alert">
          Não foi possível salvar. Tentando de novo...
        </p>
      )}

      {confirmingLogout && (
        <LogoutModal
          onCancel={() => setConfirmingLogout(false)}
          onConfirm={async () => {
            // Grava o que ainda estiver pendente antes de encerrar a sessão.
            await saveNow()
            onSignOut()
          }}
        />
      )}

      {confirmingReset && (
        <ResetContentModal
          onCancel={() => setConfirmingReset(false)}
          onConfirm={handleResetContent}
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

      {addingChecklistItem && (
        <AddChecklistItemModal
          name={newChecklistItemName}
          amount={newChecklistItemAmount}
          installment={newChecklistItemInstallment}
          installments={newChecklistItemInstallments}
          installmentAmount={newChecklistItemInstallmentAmount}
          onNameChange={setNewChecklistItemName}
          onAmountChange={setNewChecklistItemAmount}
          onInstallmentChange={setNewChecklistItemInstallment}
          onInstallmentsChange={setNewChecklistItemInstallments}
          onInstallmentAmountChange={setNewChecklistItemInstallmentAmount}
          cards={pickingChecklistCard ? cardsState : undefined}
          cardId={addingChecklistItem}
          onCardChange={setAddingChecklistItem}
          onCancel={() => {
            setPickingChecklistCard(false)
            setAddingChecklistItem(null)
            setNewChecklistItemName('')
            setNewChecklistItemAmount('')
            setNewChecklistItemInstallment(false)
            setNewChecklistItemInstallments('')
            setNewChecklistItemInstallmentAmount('')
          }}
          onSubmit={handleAddChecklistItem}
        />
      )}

      {editingChecklistItem && (
        <EditChecklistItemModal
          name={editChecklistItemDraft}
          amount={editChecklistItemAmountDraft}
          installment={editChecklistItemInstallmentDraft}
          installments={editChecklistItemInstallmentsDraft}
          installmentAmount={editChecklistItemInstallmentAmountDraft}
          onNameChange={setEditChecklistItemDraft}
          onAmountChange={setEditChecklistItemAmountDraft}
          onInstallmentChange={setEditChecklistItemInstallmentDraft}
          onInstallmentsChange={setEditChecklistItemInstallmentsDraft}
          onInstallmentAmountChange={setEditChecklistItemInstallmentAmountDraft}
          onCancel={() => {
            setEditingChecklistItem(null)
            setEditChecklistItemDraft('')
            setEditChecklistItemAmountDraft('')
            setEditChecklistItemInstallmentDraft(false)
            setEditChecklistItemInstallmentsDraft('')
            setEditChecklistItemInstallmentAmountDraft('')
          }}
          onSubmit={handleSaveChecklistItem}
        />
      )}

      {editingCardId !== null && (
        <EditCardModal
          brand={editCardBrand}
          network={editCardNetwork}
          lastDigits={editCardLastDigits}
          holder={editCardHolder}
          color={editCardColor}
          onBrandChange={setEditCardBrand}
          onNetworkChange={setEditCardNetwork}
          onLastDigitsChange={setEditCardLastDigits}
          onHolderChange={setEditCardHolder}
          onColorChange={setEditCardColor}
          onCancel={handleCloseEditCard}
          onSubmit={handleSaveCard}
        />
      )}

      {receivableForm && (
        <ReceivableModal
          {...receivableModalTexts[receivableForm.mode]}
          description={
            receivableForm.mode === 'edit' && receivableForm.nameOnly
              ? 'Altere o nome. Os valores de cada compra são editados no card de detalhes.'
              : receivableModalTexts[receivableForm.mode].description(receivableForm.ownerName)
          }
          nameOnly={receivableForm.mode === 'edit' && receivableForm.nameOnly}
          name={receivableName}
          amount={receivableAmount}
          onNameChange={setReceivableName}
          onAmountChange={setReceivableAmount}
          installment={receivableInstallment}
          installments={receivableInstallments}
          installmentAmount={receivableInstallmentAmount}
          onInstallmentChange={setReceivableInstallment}
          onInstallmentsChange={setReceivableInstallments}
          onInstallmentAmountChange={setReceivableInstallmentAmount}
          onCancel={closeReceivableForm}
          onSubmit={handleSubmitReceivable}
        />
      )}

      {showingDetails && (
        <DetailsModal
          cardsLimitTotal={cardsLimitTotal}
          cardsCount={cardsState.length}
          paidCount={paidCount}
          pendingCount={pendingCount}
          onClose={() => setShowingDetails(false)}
        />
      )}

      <main className="dashboard">
        {activeView === 'overview' && (
          <OverviewPage
            summaryActions={summaryActions}
            heroLabel={heroLabel}
            heroValue={heroValue}
            onSummaryAction={handleSummaryAction}
            cardsState={cardsState}
            onAddCard={() => setAddingCard(true)}
            onDeleteCard={deleteCard}
            onEditCard={handleOpenEditCard}
            onAdjustPaidInstallments={adjustPaidInstallments}
            expenses={expenses}
            onToggleExpense={toggleExpense}
            onAddExpenseClick={() => setAddingExpense(true)}
            onEditExpense={handleOpenEditExpense}
            onDeleteExpense={deleteExpense}
            receivables={receivables}
            customWidgets={customWidgets}
            onRemoveWidget={handleRemoveWidget}
            onResetContent={() => setConfirmingReset(true)}
          />
        )}

        {activeView === 'cards' && (
          <CardsPage
            cardsState={cardsState}
            onAddCard={() => setAddingCard(true)}
            onDeleteCard={deleteCard}
            onEditCard={handleOpenEditCard}
            onAddChecklistItem={setAddingChecklistItem}
            onEditChecklistItem={handleOpenEditChecklistItem}
            onDeleteChecklistItem={deleteChecklistItem}
          />
        )}

        {activeView === 'expenses' && (
          <ExpensesPage
            cardsState={cardsState}
            onAddCard={() => setAddingCard(true)}
            onAddInstallment={handleOpenAddInstallment}
            expenses={expenses}
            onToggleExpense={toggleExpense}
            onAddExpenseClick={() => setAddingExpense(true)}
            onEditExpense={handleOpenEditExpense}
            onDeleteExpense={deleteExpense}
          />
        )}

        {activeView === 'third-party' && (
          <ThirdPartyPage
            receivables={receivables}
            onTogglePurchase={toggleReceivablePurchase}
            onAdjustPaid={adjustPaidReceivableInstallments}
            onAddClick={handleOpenAddReceivable}
            onAddPurchase={handleOpenAddReceivablePurchase}
            onEdit={handleOpenEditReceivable}
            onEditPurchase={handleOpenEditReceivablePurchase}
            onDelete={deleteReceivable}
            onDeletePurchase={deleteReceivablePurchase}
          />
        )}

        {activeView === 'reports' && (
          <ReportsPage
            cardsState={cardsState}
            expenses={expenses}
            receivables={receivables}
          />
        )}
      </main>
    </div>
  )
}
