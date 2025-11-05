import { useState } from "react";
import { useParams } from "react-router-dom";
import '../styles/cavalierPage.scss';

export function CavalierPage() {
  const { id } = useParams<{ id: string }>();

  // États pour les badges
  const [coursTags, setCoursTags] = useState<string[]>([]);
  const [coursInput, setCoursInput] = useState("");

  const [caracTags, setCaracTags] = useState<string[]>([]);
  const [caracInput, setCaracInput] = useState("");

  // Fonction générique pour ajouter un tag à l'appui sur Entrée
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    inputValue: string,
    setTags: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      setTags((prev) => [...prev, inputValue.trim()]);
      setInput("");
      e.preventDefault();
    }
  };

  return (
    <div className="cavalier-container">
      <div className="cavalier-header">
        <div className="cavalier-image"></div>
        <h1 className="cavalier-title">Cavalier {id}</h1>
      </div>

      <div className="separator"></div>

      <div className="cavalier-info">
        <div className="info-item">
          <span className="info-label">Numéro de licence:</span> 12345
        </div>
        <div className="info-item">
          <span className="info-label">Membre depuis:</span> 2020
        </div>

        {/* Zone Cours */}
        <div className="info-item interactive-container">
          <span className="info-label">Cours:</span>
          <div className="interactive-box">
            <div className="ellipse-container">
              {coursTags.map((tag, idx) => (
                <div key={idx} className="ellipse">{tag}</div>
              ))}
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="Ajouter un cours..."
              value={coursInput}
              onChange={(e) => setCoursInput(e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(e, coursInput, setCoursTags, setCoursInput)
              }
            />
          </div>
        </div>

        {/* Zone Caractéristiques */}
        <div className="info-item interactive-container">
          <span className="info-label">Caractéristiques:</span>
          <div className="interactive-box">
            <div className="ellipse-container">
              {caracTags.map((tag, idx) => (
                <div key={idx} className="ellipse">{tag}</div>
              ))}
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="Ajouter une caractéristique..."
              value={caracInput}
              onChange={(e) => setCaracInput(e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(e, caracInput, setCaracTags, setCaracInput)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
