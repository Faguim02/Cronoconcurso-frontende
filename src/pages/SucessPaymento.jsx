import { useNavigate } from "react-router-dom";
import "../styles/paymentSucess.css";
import { useEffect } from "react";
import { UsuarioService } from "../services/Usuario/UsuarioService";

const userService = new UsuarioService();

const PagamentoSucesso = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fethUser = async() => {
      const user = await userService.AboutUser();
      localStorage.setItem('user', JSON.stringify(user));
    }
    fethUser()
  }, [])

  return (
    <div className="payment-success-container">
      <div className="payment-success-content">
        <div className="payment-success-icon">✓</div>
        <h1 className="payment-success-title">Pagamento Confirmado!</h1>
        <p className="payment-success-desc">
          Seu pagamento foi processado com sucesso. Agora você tem acesso completo à plataforma.
        </p>

        <div className="payment-success-card">
          <p><span>Status:</span> <strong style={{ color: '#43aa8b' }}>Aprovado</strong></p>
          {/* <p><span>Plano:</span> <strong>Premium Concursos</strong></p>
          <p><span>Validade:</span> <strong>12 meses</strong></p> */}
        </div>

        <div className="payment-success-actions">
          <button className="payment-success-btn-primary" onClick={() => navigate("/cronogramas")}>
            Ir para os Cronogramas
          </button>
          <button className="payment-success-btn-secondary" onClick={() => navigate("/questoes")}>
            Resolver Questões
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagamentoSucesso;
