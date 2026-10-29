import { ExpensesPanel } from '../components/ExpensesPanel'
import { InstallmentPurchasesPanel } from '../components/InstallmentPurchasesPanel'

export function ExpensesPage({
  expenses,
  onToggleExpense,
  onAddExpenseClick,
  onEditExpense,
  onDeleteExpense,
  cardsState,
  onAddCard,
  onAddInstallment,
}) {
  return (
    <>
      <ExpensesPanel
        expenses={expenses}
        onToggle={onToggleExpense}
        onAddClick={onAddExpenseClick}
        onAddCardClick={onAddCard}
        onEdit={onEditExpense}
        onDelete={onDeleteExpense}
        standalone
      />

      <InstallmentPurchasesPanel cards={cardsState} onAddClick={onAddInstallment} />
    </>
  )
}
