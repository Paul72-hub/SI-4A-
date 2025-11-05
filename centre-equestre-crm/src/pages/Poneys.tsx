import React from "react";
import "./Poneys.scss"; // On importe le fichier SCSS

// ----- Type de données -----
type Poney = {
  id: number;
  nom: string;
  age: string;
  sexe: string;
  race: string;
  numeroSire: string;
  taille: string;
  poids: string;
  robe: string;
  image: string;
};

// ----- Données exemple -----
const poneysData: Poney[] = [
  {
    id: 1,
    nom: "Petit Tonnerre",
    age: "5 ans",
    sexe: "Jument",
    race: "Shetland",
    numeroSire: "123456789",
    taille: "90 cm",
    poids: "150 kg",
    robe: "Pie alezan",
    image: "./images/petit-tonnerre.jpg",
  },
  {
    id: 2,
    nom: "Petit Tonnerre",
    age: "5 ans",
    sexe: "Jument",
    race: "Shetland",
    numeroSire: "123456789",
    taille: "90 cm",
    poids: "150 kg",
    robe: "Pie alezan",
    image: "./images/petit-tonnerre.jpg",
  },
  {
    id: 3,
    nom: "Petit Tonnerre",
    age: "5 ans",
    sexe: "Jument",
    race: "Shetland",
    numeroSire: "123456789",
    taille: "90 cm",
    poids: "150 kg",
    robe: "Pie alezan",
    image: "./images/petit-tonnerre.jpg",
  },
];

// ----- Composant Carte Poney -----
const PoneyCard: React.FC<{ poney: Poney }> = ({ poney }) => {
  return (
    <div className="poney-card">
      <div className="poney-image">
        <img src={poney.image} alt={poney.nom} />
      </div>

      <div className="buttons">
        <button className="edit-btn">Edit Profile</button>
        <button className="share-btn">Share Profile</button>
      </div>

      <div className="poney-info">
        <h2>{poney.nom}</h2>
        <p>{poney.age}</p>
        <p>{poney.sexe}</p>
      </div>

      <hr />

      <div className="poney-details">
        <p><strong>Race :</strong> {poney.race}</p>
        <p><strong>Numéro SIRE :</strong> {poney.numeroSire}</p>
        <p><strong>Taille :</strong> {poney.taille}</p>
        <p><strong>Poids :</strong> {poney.poids}</p>
        <p><strong>Robe :</strong> {poney.robe}</p>
      </div>
    </div>
  );
};

// ----- Composant Principal des Poneys -----
export function PoneysPage() {
  return (
    <section className="poneys-page">
      <h1>Fiches des Poneys</h1>

      <div className="poney-grid">
        {poneysData.map((poney) => (
          <PoneyCard key={poney.id} poney={poney} />
        ))}
      </div>
    </section>
  );
}
