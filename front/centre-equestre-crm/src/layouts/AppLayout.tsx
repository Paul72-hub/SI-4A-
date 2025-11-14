import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import type { IconType } from 'react-icons'
import { FiCalendar, FiHome, FiMessageSquare, FiUsers } from 'react-icons/fi'
import { GiHorseHead } from 'react-icons/gi'
import { useAuth } from '../context/AuthContext'

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
  //{ to: '/cavalier', label: 'Cavalier', icon: }
]

type AppLayoutProps = {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() : ''

  const handleLogout = async () => {
    await logout()
    navigate('/connexion')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="../images/jval.png" alt="Logo JVAL" className="logo" />
          <span>JVAL</span>
        </div>
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
          <span className="welcome">{user ? `Bonjour ${displayName}` : 'Bonjour !'}</span>
          {user ? (
            <button type="button" className="login-button logout" onClick={handleLogout}>
              Se déconnecter
            </button>
          ) : (
            <NavLink to="/connexion" className="login-button">
              Se connecter
            </NavLink>
          )}
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
