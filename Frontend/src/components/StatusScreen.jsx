import './StatusScreen.css'

// Tela cheia simples para carregamento e erros antes do painel aparecer.
export function StatusScreen({ message, actionLabel, onAction }) {
  return (
    <div className="status-screen" role="status">
      <p>{message}</p>
      {onAction && (
        <button className="pill-button status-screen-action" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
