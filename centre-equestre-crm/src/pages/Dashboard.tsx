export function DashboardPage() {
  return (
    <section>
      <h2>Vue d&apos;ensemble</h2>
      <p>
        Cette zone accueillera les indicateurs principaux : planning du jour,
        disponibilite des chevaux, messages importants et demandes en attente.
      </p>
      <div className="placeholder-grid">
        <article>
          <h3>Statut du jour</h3>
          <p>Resume des cours programmes et des ressources necessaires.</p>
        </article>
        <article>
          <h3>Notifications</h3>
          <p>Alertes de sante, messages urgents et taches a suivre.</p>
        </article>
        <article>
          <h3>Suivi de l&apos;activite</h3>
          <p>Rapport des dernieres seances et taux d&apos;occupation.</p>
        </article>
      </div>
    </section>
  )
}
