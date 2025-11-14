import { useEffect, useMemo, useState } from "react"
import "../styles/Users.scss"
import { getUsers, type UserResponse } from "../services/api"
import { useAuth } from "../context/AuthContext"

type RoleFilter = "ALL" | "CAVALIER" | "MONITEUR" | "DIRECTEUR"

const roleLabels: Record<RoleFilter, string> = {
  ALL: "Tous",
  CAVALIER: "Cavaliers",
  MONITEUR: "Moniteurs",
  DIRECTEUR: "Directeurs",
}

const roleColors: Record<string, string> = {
  CAVALIER: "#2563eb",
  MONITEUR: "#16a34a",
  DIRECTEUR: "#d97706",
}

export function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<RoleFilter>("ALL")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await getUsers()
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les utilisateurs")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = filter === "ALL" || u.role === filter
      const query = search.trim().toLowerCase()
      const matchesQuery =
        query.length === 0 ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      return matchesRole && matchesQuery
    })
  }, [users, filter, search])

  const stats = useMemo(() => {
    const base = { cavaliers: 0, moniteurs: 0, directeurs: 0 }
    users.forEach((u) => {
      if (u.role === "CAVALIER") base.cavaliers += 1
      if (u.role === "MONITEUR") base.moniteurs += 1
      if (u.role === "DIRECTEUR") base.directeurs += 1
    })
    return base
  }, [users])

  return (
    <section className="users-page">
      <header className="users-header">
        <div>
          <h2>Gestion des utilisateurs</h2>
          <p>Visualisez les cavaliers, moniteurs et directeurs avec leurs contacts et rôles.</p>
        </div>
        {user?.role === "DIRECTEUR" && (
          <button type="button" className="btn-primary subtle">
            Ajouter un utilisateur
          </button>
        )}
      </header>

      <div className="users-stats">
        <div>
          <span>Total</span>
          <strong>{users.length}</strong>
        </div>
        <div>
          <span>Cavaliers</span>
          <strong>{stats.cavaliers}</strong>
        </div>
        <div>
          <span>Moniteurs</span>
          <strong>{stats.moniteurs}</strong>
        </div>
        <div>
          <span>Directeurs</span>
          <strong>{stats.directeurs}</strong>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="role-filters">
          {(Object.keys(roleLabels) as RoleFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {roleLabels[key]}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Rechercher par nom ou email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="users-grid">
        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <p>Aucun utilisateur ne correspond à vos critères.</p>
        ) : (
          filteredUsers.map((u) => (
            <article key={u.id} className="user-card">
              <header>
                <div>
                  <h3>
                    {u.firstName} {u.lastName}
                  </h3>
                  <p>{u.email}</p>
                </div>
                <span className="role-pill" style={{ background: roleColors[u.role] ?? "#6b7280" }}>
                  {u.role}
                </span>
              </header>
              {u.phone && (
                <p className="user-phone">
                  <strong>Tél :</strong> {u.phone}
                </p>
              )}
              {user?.role === "DIRECTEUR" && (
                <div className="user-actions">
                  <button type="button" className="btn-secondary">
                    Modifier
                  </button>
                  <button type="button" className="btn-link">
                    Voir le profil
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  )
}
