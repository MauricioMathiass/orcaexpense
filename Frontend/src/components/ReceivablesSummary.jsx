import { UsersIcon } from './icons'
import { formatCurrency } from '../utils/formatCurrency'
import { roundMoney } from '../utils/money'
import './ReceivablesSummary.css'

export function ReceivablesSummary({ receivables }) {
  const sum = (items) => roundMoney(items.reduce((total, item) => total + (item.amount || 0), 0))

  const pending = receivables.filter((item) => !item.received)
  const received = receivables.filter((item) => item.received)
  const totalValue = sum(receivables)
  const receivedValue = sum(received)
  const pendingValue = sum(pending)
  const receivedPercent =
    totalValue > 0 ? Math.min(100, Math.round((receivedValue / totalValue) * 100)) : 0

  return (
    <article className="panel widget receivables-summary">
      <div className="widget-header">
        <h3>Valores de Terceiros</h3>
        <span className="widget-icon green">
          <UsersIcon />
        </span>
      </div>

      {receivables.length === 0 ? (
        <p>Nenhum valor cadastrado. Adicione na página Valores de Terceiros.</p>
      ) : (
        <>
          <div className="receivables-stats">
            <div className="receivables-stat">
              <span>Total</span>
              <strong>{formatCurrency(totalValue)}</strong>
            </div>
            <div className="receivables-stat">
              <span>Recebido</span>
              <strong className="receivables-received">{formatCurrency(receivedValue)}</strong>
            </div>
            <div className="receivables-stat">
              <span>A receber</span>
              <strong className="receivables-pending">{formatCurrency(pendingValue)}</strong>
            </div>
          </div>

          <div className="limit-progress" aria-hidden="true">
            <span className="limit-progress-fill" style={{ width: `${receivedPercent}%` }} />
          </div>
          <span className="limit-progress-caption">
            {received.length} de {receivables.length} recebidos ({receivedPercent}%)
          </span>

          {pending.length === 0 ? (
            <p className="receivables-done">Tudo recebido.</p>
          ) : (
            <ul className="receivables-list">
              {pending.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <strong>{formatCurrency(item.amount || 0)}</strong>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </article>
  )
}
