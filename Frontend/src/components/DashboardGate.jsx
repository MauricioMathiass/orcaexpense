import { useCallback, useEffect, useState } from 'react'
import { fetchState } from '../services/api'
import { DashboardLayout } from './DashboardLayout'
import { StatusScreen } from './StatusScreen'
import { summaryActions } from '../pages/OverviewPage'

// Carrega os dados do usuário no servidor antes de mostrar o painel. Assim a gravação automática
// nunca parte de um estado vazio por engano (o que apagaria os dados guardados).
export function DashboardGate({ onSignOut }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    let cancelled = false
    setError(null)

    fetchState()
      .then((state) => {
        if (!cancelled) setData(state)
      })
      .catch((caught) => {
        if (!cancelled) setError(caught)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => load(), [load])

  if (error?.status === 401 || error?.code === 'unauthenticated') {
    return (
      <StatusScreen
        message="Sua sessão expirou. Entre novamente."
        actionLabel="Ir para o login"
        onAction={onSignOut}
      />
    )
  }

  if (error) {
    return (
      <StatusScreen
        message={`Não foi possível carregar seus dados. ${error.message}`}
        actionLabel="Tentar de novo"
        onAction={load}
      />
    )
  }

  if (!data) return <StatusScreen message="Carregando seus dados..." />

  return <DashboardLayout summaryActions={summaryActions} initialData={data} onSignOut={onSignOut} />
}
