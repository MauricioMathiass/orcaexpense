import { DashboardLayout } from './components/DashboardLayout'

const summaryActions = [
  { id: 'add', label: 'Adicionar', icon: 'plus' },
  { id: 'expenses', label: 'Despesas Fixas', icon: 'wallet' },
  { id: 'cards', label: 'Cartoes', icon: 'card' },
  { id: 'details', label: 'Detalhes', icon: 'details' },
  { id: 'total', label: 'Gastos Totais', icon: 'sum' },
]

const cards = [
  {
    id: 1,
    brand: 'MEU CARTAO',
    network: 'Gold',
    holder: 'MAURICIO S MATIAS',
    lastDigits: '1894',
    bgClass: 'card-dark',
    limit: 2000,
    spent: 640,
  },
  {
    id: 2,
    brand: 'ITAU',
    network: 'Visa',
    holder: 'MAURICIO S MATIAS',
    lastDigits: '3341',
    bgClass: 'card-orange',
    limit: 2600,
    spent: 980.5,
  },
  {
    id: 3,
    brand: 'PICPAY',
    network: 'Platinum',
    holder: 'MAURICIO S MATIAS',
    lastDigits: '5521',
    bgClass: 'card-green',
    limit: 2000,
    spent: 293.2,
  },
]

const fixedExpenses = [
  { name: 'Aluguel', paid: true, amount: 1200 },
  { name: 'Internet', paid: true, amount: 120 },
  { name: 'Energia', paid: false, amount: 180 },
]

function App() {
  return (
    <DashboardLayout
      summaryActions={summaryActions}
      cards={cards}
      fixedExpenses={fixedExpenses}
    />
  )
}

export default App
