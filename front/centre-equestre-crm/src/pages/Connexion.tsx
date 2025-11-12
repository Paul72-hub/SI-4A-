import { useState } from 'react';
import '../styles/Connexion.scss';

export function ConnexionPage() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Identifiant:', identifiant, 'Mot de passe:', motDePasse);
  };

  return (
    <div className="connexion-page">
      <div className="connexion-card">
        <h2>Se connecter</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Identifiant
            <input
              type="text"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="Entrez votre identifiant"
              required
            />
          </label>
          <label>
            Mot de passe
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Entrez votre mot de passe"
              required
            />
          </label>
          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
