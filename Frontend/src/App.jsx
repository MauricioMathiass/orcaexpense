import { useEffect, useState } from 'react'
import { DashboardGate } from './components/DashboardGate'
import { StatusScreen } from './components/StatusScreen'
import { LoginPage } from './pages/LoginPage'
import { getSession, signOut } from './services/auth'

function App() {
  // undefined: ainda verificando se já existe uma sessão; null: sem login.
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    getSession().then((session) => {
      if (!cancelled) setUser(session)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSignOut() {
    await signOut()
    setUser(null)
  }

  if (user === undefined) return <StatusScreen message="Carregando..." />
  if (!user) return <LoginPage onAuthenticated={setUser} />

  return <DashboardGate key={user.id} onSignOut={handleSignOut} />
}

export default App
