export function UsersPage() {
  return (
    <section>
      <h2>Gestion des utilisateurs</h2>
      <p>
        Les cavaliers, moniteurs et membres du staff seront listes ici avec
        filtres, informations de contact et suivi des niveaux.
      </p>
      <div className="placeholder-panel">
        <h3>Prochaines etapes</h3>
        <ul>
          <li>Definir le modele de donnees (chevaux, cavaliers, roles).</li>
          <li>Activer la creation et la mise a jour des profils.</li>
          <li>Ajouter tags et notes pour simplifier les appariements.</li>
        </ul>
      </div>
    </section>
  )
}
