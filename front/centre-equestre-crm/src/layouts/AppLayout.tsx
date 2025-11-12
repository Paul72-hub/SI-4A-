import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { IconType } from 'react-icons'
import { FiCalendar, FiHome, FiMessageSquare, FiUsers } from 'react-icons/fi'
import { GiHorseHead } from 'react-icons/gi'

type NavItem = {
  to: string
  label: string
  icon: IconType
}

const navItems: NavItem[] = [
  { to: '/', label: 'Tableau de bord', icon: FiHome },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: FiUsers },
  { to: '/messagerie', label: 'Messagerie', icon: FiMessageSquare },
  { to: '/agenda', label: 'Agenda', icon: FiCalendar },
  { to: '/poneys', label: 'Poneys', icon: GiHorseHead },
]

type AppLayoutProps = {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="brand">Jval</h1>
        <p className="tagline">CRM centre equestre</p>
        <nav aria-label="Navigation principale">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      isActive ? 'nav-link active' : 'nav-link'
                    }
                    end={item.to === '/'}
                  >
                    <Icon className="nav-icon" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
      <div className="content-area">
        <header className="topbar">
          <span className="welcome">Bonjour Paul !</span>
          <NavLink to="/connexion" className="login-button">
            Se connecter
          </NavLink>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
