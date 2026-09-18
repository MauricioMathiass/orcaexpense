import { ExpensesPanel } from '../components/ExpensesPanel'

export function ExpensesPage({ expenses, onToggleExpense, onAddExpenseClick, onEditExpense, onDeleteExpense }) {
  return (
    <ExpensesPanel
      expenses={expenses}
      onToggle={onToggleExpense}
      onAddClick={onAddExpenseClick}
      onEdit={onEditExpense}
      onDelete={onDeleteExpense}
      standalone
    />
  )
}
