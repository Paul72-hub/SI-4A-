import { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Tableau de bord' },
  { to: '/utilisateurs', label: 'Utilisateurs' },
  { to: '/messagerie', label: 'Messagerie' },
  { to: '/agenda', label: 'Agenda' },
]

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="brand">Les Poneys</h1>
        <p className="tagline">CRM centre equestre</p>
        <nav aria-label="Navigation principale">
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="content-area">
        <header className="topbar">
          <span className="welcome">Bonjour Paul !</span>
          <span className="status-badge">Version alpha</span>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
