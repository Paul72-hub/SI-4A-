import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import "../styles/Poneys.scss";

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
  occupe: boolean; // nouveau champ
};

// ----- Données exemple -----
const poneysData: Poney[] = [
  { id: 1, nom: "Petit Tonnerre", age: "5 ans", sexe: "Jument", race: "Shetland", numeroSire: "123456789", taille: "90 cm", poids: "150 kg", robe: "Pie alezan", image: "./images/petit-tonnerre.jpg", occupe: true },
  { id: 2, nom: "Éclair", age: "8 ans", sexe: "Hongre", race: "Connemara", numeroSire: "987654321", taille: "120 cm", poids: "250 kg", robe: "Gris pommelé", image: "./images/eclair.jpg", occupe: false },
  { id: 3, nom: "Foudre", age: "6 ans", sexe: "Jument", race: "Welsh", numeroSire: "456789123", taille: "100 cm", poids: "180 kg", robe: "Alezan brûlé", image: "./images/foudre.jpg", occupe: true },
  { id: 4, nom: "Biscotte", age: "7 ans", sexe: "Jument", race: "PFS", numeroSire: "654987321", taille: "110 cm", poids: "200 kg", robe: "Bai clair", image: "./images/biscotte.jpg", occupe: false },
  { id: 5, nom: "Mistral", age: "9 ans", sexe: "Hongre", race: "Dartmoor", numeroSire: "852369741", taille: "105 cm", poids: "220 kg", robe: "Noir pangaré", image: "./images/mistral.jpg", occupe: true },
  { id: 6, nom: "Caramel", age: "4 ans", sexe: "Jument", race: "Shetland", numeroSire: "159753486", taille: "95 cm", poids: "160 kg", robe: "Alezan clair", image: "./images/caramel.jpg", occupe: false },
];

// ----- Calcul dynamique pour le camembert -----
const occupeCount = poneysData.filter(p => p.occupe).length;
const dispoCount = poneysData.length - occupeCount;

const Dispos = [
  { name: "Occupés", value: occupeCount },
  { name: "Disponibles", value: dispoCount },
];

const COLORS = ["#8B5E3C", "#7B8D42"]; // Occupé = marron, Disponible = vert

// ----- Carte Poney -----
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
        <div className="poney-status" style={{ color: poney.occupe ? "#8B5E3C" : "#7B8D42", fontWeight: "bold", marginTop: "5px" }}>
          {poney.occupe ? "Occupé" : "Disponible"}
        </div>
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

// ----- Page principale -----
export function PoneysPage() {
  return (
    <section className="poneys-page">
      <h1>Fiches des Poneys</h1>

      <div className="poney-layout">
        {/* Camembert à gauche */}
        <div className="poney-chart">
          <h3>Occupation des poneys</h3>
          <PieChart width={250} height={250}>
            <Pie
              data={Dispos}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {Dispos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Fiches à droite */}
        <div className="poney-grid">
          {poneysData.map((poney) => (
            <PoneyCard key={poney.id} poney={poney} />
          ))}
        </div>
      </div>
    </section>
  );
}
