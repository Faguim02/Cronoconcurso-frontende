import { useNavigate } from "react-router-dom";
import "../styles/notfound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-emoji">🔍</div>
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">Página não encontrada</h1>
        <p className="notfound-desc">
          A página que você está procurando não existe ou foi movida.
        </p>
        <button className="notfound-btn" onClick={() => navigate("/")}>
          ← Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default NotFound;
