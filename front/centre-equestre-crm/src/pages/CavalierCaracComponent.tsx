import { useState, useRef, useEffect } from "react";

export function CavalierCaracComponent() {
  const caracContainerRef = useRef<HTMLDivElement>(null);
  const [caracTags, setCaracTags] = useState<string[]>([]);
  const [showAddCarac, setShowAddCarac] = useState(false);
  const [searchCarac, setSearchCarac] = useState("");

  const allCarac = [
    "Rapide","Endurant","Calme","Obéissant","Puissant",
    "Agile","Réactif","Sociable","Confiant","Travailleur",
    "Flexible","Doux","Énergique","Prudent","Courageux"
  ];

  const filteredCarac = allCarac.filter(c => c.toLowerCase().includes(searchCarac.toLowerCase()) && !caracTags.includes(c));

  const addCarac = (carac:string) => {
    if(!caracTags.includes(carac)) setCaracTags([...caracTags, carac]);
    setShowAddCarac(false); setSearchCarac("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if(caracContainerRef.current && !caracContainerRef.current.contains(event.target as Node)){
        setShowAddCarac(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="info-item interactive-container" ref={caracContainerRef}>
      <span className="info-label">Caractéristiques:</span>
      <div className="interactive-box">
        <div className="ellipse-container">
          {caracTags.map((tag, idx) => <div key={idx} className="ellipse">{tag}</div>)}
        </div>
        <button className="add-cours-btn" onClick={()=>setShowAddCarac(!showAddCarac)}>
          Ajouter une caractéristique
        </button>

        {showAddCarac && (
          <div className="cours-list">
            <input type="text" placeholder="Rechercher..." value={searchCarac} onChange={(e)=>setSearchCarac(e.target.value)}/>
            {filteredCarac.length > 0 ? (
              filteredCarac.map(carac => <div key={carac} className="cours-item" onClick={()=>addCarac(carac)}>{carac}</div>)
            ) : (
              <div className="no-item">Aucune caractéristique</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
