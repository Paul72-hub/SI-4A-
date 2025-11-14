import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type AuthUser = {
  id: number
  email: string
  role: string
  firstName?: string
  lastName?: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

const STORAGE_KEY = 'crm-auth-user'

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  })

  const login = (authUser: AuthUser) => {
    setUser(authUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
  }

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/logout`, { method: 'POST' })
    } catch {
      // ignorer silencieusement
    }
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
