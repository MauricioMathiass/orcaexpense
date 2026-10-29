import { useEffect, useRef, useState } from 'react'
import logoPrincipal from '../assets/LogoPrincipal.png'
import { UsersIcon } from './icons'

const menuItems = [
  { id: 'overview', label: 'Visão Geral', icon: GridIcon },
  { id: 'cards', label: 'Meus Cartões', icon: CardIcon },
  { id: 'expenses', label: 'Despesas Fixas', icon: WalletIcon },
  { id: 'third-party', label: 'Valores de Terceiros', icon: UsersIcon },
  { id: 'reports', label: 'Relatórios', icon: ReportIcon },
]

// Em telas estreitas o menu vira uma gaveta na lateral esquerda (mesmo ponto de corte do CSS).
const DRAWER_QUERY = '(max-width: 1080px)'
// Movimento mínimo (px) para um toque virar arraste, e velocidade (px/ms) que decide o gesto sozinha.
const DRAG_THRESHOLD = 6
const FLICK_VELOCITY = 0.4

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

function useDrawerMode() {
  const [matches, setMatches] = useState(() => window.matchMedia(DRAWER_QUERY).matches)

  useEffect(() => {
    const query = window.matchMedia(DRAWER_QUERY)
    const update = () => setMatches(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return matches
}

export function SidebarMenu({ activeView, onNavigate, onLogout }) {
  const isDrawer = useDrawerMode()
  const [hovered, setHovered] = useState(false)
  const [open, setOpen] = useState(false)
  // Posição (px, 0 = fechada, largura da gaveta = aberta) enquanto o dedo está arrastando.
  const [dragOffset, setDragOffset] = useState(null)
  const drawerRef = useRef(null)
  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)

  const drawerOpen = isDrawer && open
  const dragging = dragOffset !== null
  // Na gaveta os rótulos ficam sempre visíveis; no desktop aparecem ao passar o mouse.
  const expanded = isDrawer || hovered

  useEffect(() => {
    if (!isDrawer) {
      setOpen(false)
      setDragOffset(null)
    }
  }, [isDrawer])

  useEffect(() => {
    if (!drawerOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [drawerOpen])

  // `captureNow`: a aba não tem filhos clicáveis, então captura o ponteiro já no toque (um arraste
  // de mouse rápido não escapa dela). Na gaveta a captura só vem ao arrastar, para os botões funcionarem.
  const startDrag = (event, captureNow = false) => {
    if (!isDrawer || (event.pointerType === 'mouse' && event.button !== 0)) return

    const width = drawerRef.current?.offsetWidth || 1
    suppressClickRef.current = false
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: open ? width : 0,
      width,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      active: false,
    }
    if (captureNow) event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const distance = event.clientX - drag.startX
    if (!drag.active) {
      if (Math.abs(distance) < DRAG_THRESHOLD) return
      // Só captura o ponteiro quando vira arraste, para os toques nos botões continuarem funcionando.
      drag.active = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    const elapsed = event.timeStamp - drag.lastTime
    if (elapsed > 0) drag.velocity = (event.clientX - drag.lastX) / elapsed
    drag.lastX = event.clientX
    drag.lastTime = event.timeStamp
    setDragOffset(clamp(drag.startOffset + distance, 0, drag.width))
  }

  const endDrag = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null
    if (!drag.active) return

    // O clique que o navegador dispara depois de um arraste não deve abrir/fechar de novo.
    suppressClickRef.current = true

    const offset = clamp(drag.startOffset + drag.lastX - drag.startX, 0, drag.width)
    const flicked = Math.abs(drag.velocity) > FLICK_VELOCITY
    setOpen(flicked ? drag.velocity > 0 : offset > drag.width / 2)
    setDragOffset(null)
  }

  const dragHandlers = {
    onPointerDown: (event) => startDrag(event),
    onPointerMove: moveDrag,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  }

  // `detail` é 0 nos cliques de teclado, que nunca vêm de um arraste.
  const isDragClick = (event) => suppressClickRef.current && event.detail !== 0

  const handleToggle = (event) => {
    if (isDragClick(event)) return
    setOpen((current) => !current)
  }

  const handleBackdropClick = (event) => {
    if (isDragClick(event)) return
    setOpen(false)
  }

  const handleNavigate = (id) => {
    setOpen(false)
    onNavigate(id)
  }

  const handleLogout = () => {
    setOpen(false)
    onLogout()
  }

  const stateClasses = `${drawerOpen ? 'is-open' : ''} ${dragging ? 'is-dragging' : ''}`
  const drawerWidth = drawerRef.current?.offsetWidth || 0
  const drawerStyle = dragging ? { transform: `translateX(${dragOffset - drawerWidth}px)` } : undefined
  const handleStyle = dragging ? { transform: `translateX(${dragOffset}px)` } : undefined
  const backdropStyle = dragging ? { opacity: dragOffset / (drawerWidth || 1) } : undefined

  return (
    <>
      <aside
        id="sidebar-drawer"
        ref={drawerRef}
        className={`sidebar ${expanded ? 'sidebar-expanded' : ''} ${stateClasses}`}
        style={drawerStyle}
        onMouseEnter={() => setHovered(!isDrawer)}
        onMouseLeave={() => setHovered(false)}
        {...dragHandlers}
      >
        <div className="sidebar-top">
          <div className="brand-mark" aria-hidden="true">
            <img className="brand-image" src={logoPrincipal} alt="" />
          </div>

          <div className={`brand-copy ${expanded ? 'visible' : ''}`}>
            <strong>ORÇAFY EXPENSE</strong>
            <span>CONTROLE PESSOAL DE FINANÇAS</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Menu principal">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <button
                key={item.id}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                type="button"
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleNavigate(item.id)}
              >
                <Icon />
                <span className={`sidebar-label ${expanded ? 'visible' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        <button className="sidebar-logout" type="button" aria-label="Sair" title="Sair" onClick={handleLogout}>
          <LogoutIcon />
        </button>
      </aside>

      <div
        className={`sidebar-backdrop ${stateClasses}`}
        style={backdropStyle}
        aria-hidden="true"
        onClick={handleBackdropClick}
        {...dragHandlers}
      />

      <button
        className={`sidebar-handle ${stateClasses}`}
        style={handleStyle}
        type="button"
        aria-label={drawerOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={drawerOpen}
        aria-controls="sidebar-drawer"
        onClick={handleToggle}
        {...dragHandlers}
        onPointerDown={(event) => startDrag(event, true)}
      >
        <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
          <path d="m9 6 6 6-6 6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10.5h17" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5H18v14H7.5A2.5 2.5 0 0 1 5 16.5v-9Z" />
      <path d="M18 9h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2" />
      <circle cx="16.5" cy="12" r="1" />
    </svg>
  )
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M7 4h7l4 4v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M14 4v4h4" />
      <path d="M9 17v-3" />
      <path d="M12 17v-5" />
      <path d="M15 17v-2" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h6A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 10 18.5V17" />
      <path d="M14.5 12H5" />
      <path d="m8.5 8.5-3.5 3.5 3.5 3.5" />
    </svg>
  )
}
