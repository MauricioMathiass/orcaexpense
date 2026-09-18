import { useState } from 'react'
import logoPrincipal from '../assets/LogoPrincipal.png'

const menuItems = [
  { id: 'overview', label: 'Visao Geral', icon: GridIcon },
  { id: 'cards', label: 'Meus Cartoes', icon: CardIcon },
  { id: 'expenses', label: 'Despesas Fixas', icon: WalletIcon },
]

export function SidebarMenu({ activeView, onNavigate, onLogout }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <aside
      className={`sidebar ${expanded ? 'sidebar-expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="sidebar-top">
        <div className="brand-mark" aria-hidden="true">
          <img className="brand-image" src={logoPrincipal} alt="" />
        </div>

        <div className={`brand-copy ${expanded ? 'visible' : ''}`}>
          <strong>ORCAFY EXPENSE</strong>
          <span>CONTROLE PESSOAL DE FINANCAS</span>
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
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <Icon />
              <span className={`sidebar-label ${expanded ? 'visible' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      <button className="sidebar-logout" type="button" aria-label="Sair" onClick={onLogout}>
        <LogoutIcon />
      </button>
    </aside>
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

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
      <path d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h6A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 10 18.5V17" />
      <path d="M14.5 12H5" />
      <path d="m8.5 8.5-3.5 3.5 3.5 3.5" />
    </svg>
  )
}
