import '../styles/plans.css';
import { useQuery} from '@tanstack/react-query'
import { PaymentService } from '../services/Payment/PaymentService';
import { MdOutlineClear } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UsuarioService } from '../services/Usuario/UsuarioService';


const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const invoices = [
  { id: 1, plan: 'Profissional', date: '25/01/2026', amount: 'R$ 79,00' },
  { id: 2, plan: 'Profissional', date: '25/12/2025', amount: 'R$ 79,00' },
  { id: 3, plan: 'Profissional', date: '25/11/2025', amount: 'R$ 79,00' },
  { id: 4, plan: 'Básico', date: '25/10/2025', amount: 'R$ 29,00' },
  { id: 5, plan: 'Básico', date: '25/09/2025', amount: 'R$ 29,00' },
];

const paymentService = new PaymentService();
const userService = new UsuarioService();

const Plans = () => {

  const [plan, setPlan] = useState()
  const [fatures, setFatures] = useState()
  const [messagePlan, setMessagePlan] = useState("")
  const [user, setUsuario] = useState(null)
  const [idPending, setIdPending] = useState()
  const [showModelChangePlan, setShowModelChangePlan] = useState(false)
  const [showModelCancelPlan, setShowModelCancelPlan] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['plans-and-fatures'],
      queryFn: async () => {
        const faturePlan = await paymentService.findPlanAndFatures()
        setFatures(faturePlan.invoices)
        setPlan(faturePlan.plan)
        return await paymentService.findAllPlans()
      },
      staleTime: Infinity
  })

  const navigatePage = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      if (localStorage.getItem('user') === null) {
        const user = await userService.AboutUser();
        localStorage.setItem('user', JSON.stringify(user));
        setUsuario(user);
      } else {
        const user = JSON.parse(localStorage.getItem('user'));
        setUsuario(user);
      }
    };
  
    fetchUser();
  }, [])

  async function handleCheckouPlan(planId) {

    console.log(planId+ "oi")

    const data = {
      planId: planId,
      successUrl: "https://cronoconcurso.com.br/payment/sucess",
      cancelUrl: "https://cronoconcurso.com.br/payment/cancel"
    }

    const checkout = await paymentService.checkout(data)
    if (checkout.status == "link") {
      navigatePage(checkout.link)
    } else if(checkout.status == "updated" || checkout.status == "scheduled") {

      setMessagePlan("Aguarde!")

      refetch()
      const user = await userService.AboutUser();
      localStorage.setItem('user', JSON.stringify(user));
      setUsuario(user);

      setMessagePlan(checkout.message)

      setTimeout(() => {
        console.log("Aguarde!");
      }, 1000);


      setShowModelChangePlan(false)
    }

    const user = await userService.AboutUser();
    localStorage.setItem('user', JSON.stringify(user));
    setUsuario(user);

    setShowModelChangePlan(false)

  }

  async function handleCancelPlan() {
    await paymentService.cancelPlan()
    refetch()
    const user = await userService.AboutUser();
    localStorage.setItem('user', JSON.stringify(user));
    setUsuario(user);
    setShowModelCancelPlan(false)
  }

  return (
    <div className="plans-page">
      <h1>Escolha seu plano</h1>
      <p className="subtitle">Planos flexíveis que crescem com você</p>

      {/* Mensagem informando que o plano foi alterado */}
      {messagePlan && (
        <div className="message-plan" style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100%", padding: "20px"}}>
          <p style={{marginBottom: "20px", color: "green", fontWeight: "bold", fontSize: "20px", textAlign: "center", backgroundColor: "rgba(0, 128, 0, 0.2)", borderRadius: "10px", padding: "10px"}}>{messagePlan}</p>
        </div>
      )}

      <div className="pricing-grid" style={{paddingBottom: "80px"}}>
        {data && user && data.map((p, i) => {

          console.log(user)

          const features = JSON.parse(p.resources)
          // No map, troque a verificação do plano por:
          const isMyPlan = user?.plan?.plan?.id === p.id

          // if(user.plan !== null) {
          //   isMyPlan = user && user.plan.plan && user.plan.plan.id == p.id //plan && plan.id == p.id
          // }

          return (
            <div className={`pricing-card ${i === 1 ? "featured" : ""}`} key={p.id}>
              {i === 1 && <div className="pricing-badge gradient-cta">Mais popular</div>}
              <h3>{p.name}</h3>
              <div><span className="pricing-price">R$ {String(Number(p.price).toFixed(2)).replace(".", ",")}</span><span className="pricing-period">/mês</span></div>
              <ul className="pricing-features">
                <li >{features.cronogramAccess == true ? <><CheckIcon /> Acesso aos cronogramas</>  : (<><MdOutlineClear color="red"/> Sem acesso aos cronogramas</>)}</li>
                <li>{features.cronogramAmount > 0 ? <CheckIcon /> : <MdOutlineClear color="red"/>}{ features.cronogramAmount == 0 ? "Não gera cronogramas" : features.cronogramAmount == 1 ? `${features.cronogramAmount} cronograma/mês` : `${features.cronogramAmount} cronogramas/mês` } </li>
                <li><CheckIcon/> {features.questionAmount} Questionarios por mês </li>
              </ul>
              {isMyPlan ? <button disabled className="btn-outline" >Seu plano atual</button> : <button className="btn-outline" onClick={() => {setIdPending(p.id); setShowModelChangePlan(true)}}>Adiquirir</button> }
            </div>
          )

        })}
      </div>

        <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100%", padding: "20px"}}>
          <button onClick={() => setShowModelCancelPlan(true)}>Cancelar plano</button>
        </div>

      <div className="invoices-section">
        <h2>Faturas pagas</h2>
        <div className="invoices-list">
          {user && user.invoices.map((inv) => (
            <div key={inv.id} className="invoice-item">
              <div className="invoice-left">
                <span className="invoice-plan">Plano {inv.name}</span>
                <span className="invoice-date">{inv.date}</span>
              </div>
              <div className="invoice-right">
                <span className="invoice-amount">R$ {String(Number(inv.price).toFixed(2)).replace(".", ",")}</span>
                <span className="invoice-status" style={{color: inv.status !== "pago" && "red"}}>{inv.status}</span>
                <button className="invoice-download">Comprovante</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModelChangePlan && (
        <div className='landing-modal-overlay'>
          <div className="landing-modal" onClick={e => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => {setShowModelChangePlan(false); setIdPending(null)}}>✕</button>
            <h2 className='landing-modal-title'>Alterar plano</h2>
            <p className='landing-modal-sub'>Tem certeza que deseja alterar seu plano para o plano <strong>{data.find(p => p.id == idPending).name}</strong>?</p>
            <div style={{display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr"}}>
              <button onClick={() => handleCheckouPlan(idPending)}>Sim</button>
              <button onClick={() => {setShowModelChangePlan(false); setIdPending(null)}}>Cancelar</button>
            </div>

            {messagePlan && (
              <div className="message-plan" style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100%", padding: "20px"}}>
                <p style={{marginBottom: "20px", color: "green", fontWeight: "bold", fontSize: "20px", textAlign: "center", backgroundColor: "rgba(0, 128, 0, 0.2)", borderRadius: "10px", padding: "10px"}}>{messagePlan}</p>
              </div>
            )}
            
          </div>
        </div>
      )}

      {showModelCancelPlan && (
        <div className='landing-modal-overlay'>
          <div className="landing-modal" onClick={e => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => {setShowModelChangePlan(false); setIdPending(null)}}>✕</button>
            <h2 className='landing-modal-title'>Alterar plano</h2>
            <p className='landing-modal-sub'>Tem certeza que deseja cancelar o plano <strong>{user.plan.plan.name}</strong>?</p>
            <div style={{display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr"}}>
              <button onClick={() => handleCancelPlan()}>Sim</button>
              <button onClick={() => {setShowModelChangePlan(false);}}>Cancelar</button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Plans;
