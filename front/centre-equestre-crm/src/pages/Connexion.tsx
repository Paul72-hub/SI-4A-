import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Connexion.scss'

export function ConnexionPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const user = await response.json()
        localStorage.setItem('user', JSON.stringify(user)) // garde l’utilisateur en mémoire
        navigate('/') // redirige vers la page principale
      } else {
        setError('Identifiants incorrects')
      }
    } catch (err) {
      console.error(err)
      setError('Erreur de connexion')
    }
  }

  return (
    <div className="connexion-container">
      <form className="connexion-box" onSubmit={handleSubmit}>
        <h2>Connexion</h2>

        <input
          type="text"
          placeholder="Identifiant"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Se connecter</button>
      </form>
    </div>
  )
}
