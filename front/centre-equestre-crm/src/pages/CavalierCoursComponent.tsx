import { useState, useRef, useEffect } from "react";

export function CavalierCoursComponent() {
  const coursContainerRef = useRef<HTMLDivElement>(null);
  const [coursTags, setCoursTags] = useState<string[]>([]);
  const [showAddCours, setShowAddCours] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedHour, setSelectedHour] = useState("");

  const days = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
  const hours = ["18h-Coach1","18h-Coach2","19h-Coach3"];
  const dayOrder: { [key: string]: number } = {
    "Lundi":1,"Mardi":2,"Mercredi":3,"Jeudi":4,"Vendredi":5,"Samedi":6,"Dimanche":7
  };

  const addCours = () => {
    if(selectedDay && selectedHour){
      const newCours = `${selectedDay} - ${selectedHour}`;
      if(!coursTags.includes(newCours)){
        const newList = [...coursTags, newCours];
        newList.sort((a,b) => dayOrder[a.split(" - ")[0]] - dayOrder[b.split(" - ")[0]]);
        setCoursTags(newList);
      }
      setSelectedDay(""); setSelectedHour(""); setShowAddCours(false);
    }
  };

  // Fermeture automatique du dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if(coursContainerRef.current && !coursContainerRef.current.contains(event.target as Node)){
        setShowAddCours(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="info-item interactive-container" ref={coursContainerRef}>
      <span className="info-label">Cours:</span>
      <div className="interactive-box">
        <div className="ellipse-container">
          {coursTags.map((tag, idx) => <div key={idx} className="ellipse">{tag}</div>)}
        </div>
        <button className="add-cours-btn" onClick={() => setShowAddCours(!showAddCours)}>
          Ajouter un cours
        </button>

        {showAddCours && (
          <div className="cours-list">
            <select value={selectedDay} onChange={(e)=>setSelectedDay(e.target.value)}>
              <option value="">-- Choisir un jour --</option>
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
            <select value={selectedHour} onChange={(e)=>setSelectedHour(e.target.value)} disabled={!selectedDay}>
              <option value="">-- Choisir une heure --</option>
              {hours.map(hour => <option key={hour} value={hour}>{hour}</option>)}
            </select>
            <button className="add-cours-btn" onClick={addCours} disabled={!selectedDay || !selectedHour}>
              Ajouter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
