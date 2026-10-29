import { useEffect, useRef, useState } from 'react'
import { saveState } from '../services/api'

const DEBOUNCE_MS = 800
const RETRY_MS = 5000
const KEYS = ['cards', 'expenses', 'receivables', 'customWidgets']

// Grava no servidor (Postgres) o retrato dos dados sempre que algum deles muda.
//
// - Espera 800 ms sem novas mudanças antes de enviar, para juntar vários cliques numa gravação só.
// - Se a gravação falha (sem internet, servidor fora), tenta de novo a cada 5 s; `status` vira "error".
// - Nunca envia o que acabou de ser carregado: só dados que mudaram (comparados por referência).
// - `flush()` envia agora o que estiver pendente (usado antes de sair da conta).
//
// Devolve { status: "idle" | "saving" | "error", flush }.
export function useAutoSave(snapshot) {
  const [status, setStatus] = useState('idle')
  const latest = useRef(snapshot)
  const saved = useRef(snapshot)
  const timer = useRef(null)
  const inFlight = useRef(null)
  const controls = useRef(null)

  if (!controls.current) {
    const isDirty = () => KEYS.some((key) => latest.current[key] !== saved.current[key])

    const schedule = (delay) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => controls.current.flush(), delay)
    }

    const flush = async () => {
      clearTimeout(timer.current)
      if (inFlight.current) await inFlight.current
      if (!isDirty()) return

      const sending = latest.current
      let ok = false
      setStatus('saving')
      inFlight.current = saveState(sending)
        .then(() => {
          saved.current = sending
          ok = true
          setStatus('idle')
        })
        .catch(() => {
          setStatus('error')
          schedule(RETRY_MS)
        })
        .finally(() => {
          inFlight.current = null
        })

      await inFlight.current
      // Algo mudou enquanto gravava: agenda a próxima gravação.
      if (ok && isDirty()) schedule(DEBOUNCE_MS)
    }

    controls.current = { schedule, flush, isDirty }
  }

  useEffect(() => {
    latest.current = snapshot
  })

  useEffect(() => {
    if (controls.current.isDirty()) controls.current.schedule(DEBOUNCE_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.cards, snapshot.expenses, snapshot.receivables, snapshot.customWidgets])

  // Ao esconder a aba ou trocar de app no celular, grava na hora o que estiver pendente.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') controls.current.flush()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      clearTimeout(timer.current)
    }
  }, [])

  return { status, flush: () => controls.current.flush() }
}
