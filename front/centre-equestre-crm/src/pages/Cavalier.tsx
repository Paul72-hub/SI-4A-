import { useParams } from "react-router-dom";
import '../styles/CavalierPage.scss';
import { CavalierCoursComponent } from "./CavalierCoursComponent";
import { CavalierCaracComponent } from "./CavalierCaracComponent";

export function CavalierPage() {
  const { id } = useParams<{ id: string }>();

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

        <CavalierCoursComponent />
        <CavalierCaracComponent />
      </div>
    </div>
  );
}
