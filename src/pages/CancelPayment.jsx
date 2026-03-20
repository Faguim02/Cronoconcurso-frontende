import { useNavigate } from "react-router-dom";
import "../styles/cancelSucess.css";

const PagamentoCancelado = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-cancelled-container">
      <div className="payment-cancelled-content">
        <div className="payment-cancelled-icon">✕</div>
        <h1 className="payment-cancelled-title">Pagamento Cancelado</h1>
        <p className="payment-cancelled-desc">
          Seu pagamento não foi concluído. Nenhuma cobrança foi realizada.
        </p>

        <div className="payment-cancelled-reasons">
          <h3>Possíveis motivos:</h3>
          <ul>
            <li>O pagamento foi cancelado manualmente</li>
            <li>Tempo limite da transação expirou</li>
            <li>Problema com o método de pagamento</li>
            <li>Conexão interrompida durante o processo</li>
          </ul>
        </div>

        <div className="payment-cancelled-actions">
          <button className="payment-cancelled-btn-primary" onClick={() => navigate("/")}>
            Tentar Novamente
          </button>
          <button className="payment-cancelled-btn-secondary" onClick={() => navigate("/usuario/planos")}>
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagamentoCancelado;
