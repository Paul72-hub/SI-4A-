import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section>
      <h2>Page introuvable</h2>
      <p>La page demandee n&apos;existe pas encore dans notre CRM.</p>
      <Link to="/" className="nav-link">
        Retour au tableau de bord
      </Link>
    </section>
  )
}
