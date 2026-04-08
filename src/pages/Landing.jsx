import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import iconGreen from "../assets/cronoconcurso-icon-green.svg";
import "../styles/landing.css";
import { useQuery } from "@tanstack/react-query";
import { PaymentService } from "../services/Payment/PaymentService";
import { CheckIcon } from "lucide-react";
import { MdOutlineClear } from "react-icons/md";
import { UsuarioService } from "../services/Usuario/UsuarioService";

const FEATURES = [
  { emoji: "🤖", title: "IA que monta seu cronograma", desc: "Envie o edital e nossa IA cria um plano de estudos personalizado em segundos." },
  // { emoji: "📊", title: "Acompanhe seu progresso", desc: "Dashboard completo com métricas, gráficos e insights sobre sua evolução." },
  { emoji: "📝", title: "Questionarios", desc: "Questionarios gerados com IA." },
  // { emoji: "🔔", title: "Lembretes inteligentes", desc: "Notificações que te mantêm no ritmo certo, sem deixar nenhuma matéria para trás." },
];

const CODE_LENGTH = 6;

const paymentService = new PaymentService();
const userService = new UsuarioService()

const TESTIMONIALS = [
  { name: "Ana Paula", role: "Aprovada TRF3", text: "Em 4 meses organizei meus estudos e passei! O cronograma por IA foi um divisor de águas.", avatar: "AP" },
  { name: "Carlos Silva", role: "Aprovado INSS", text: "Nunca consegui manter uma rotina de estudos até usar o CronoConcurso. Recomendo demais!", avatar: "CS" },
  { name: "Mariana Costa", role: "Estudando para RF", text: "A organização que eu precisava. As questões integradas poupam muito tempo.", avatar: "MC" },
];

const Landing = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [plans , setPlans] = useState([])
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const [showVerify, setShowVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState(Array(CODE_LENGTH).fill(""));
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyCooldown, setVerifyCooldown] = useState(0);
  const verifyInputsRef = useRef([]);
  useEffect(() => {
    if (!showVerify) return;
    setTimeout(() => verifyInputsRef.current[0]?.focus(), 100);
  }, [showVerify]);
  useEffect(() => {
    if (verifyCooldown <= 0) return;
    const timer = setTimeout(() => setVerifyCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [verifyCooldown]);
  const handleVerifyChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newCode = [...verifyCode];
    newCode[index] = digit;
    setVerifyCode(newCode);
    setVerifyError("");
    if (digit && index < CODE_LENGTH - 1) {
      verifyInputsRef.current[index + 1]?.focus();
    }
  };
  const handleVerifyKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verifyCode[index] && index > 0) {
      verifyInputsRef.current[index - 1]?.focus();
    }
  };
  const handleVerifyPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const newCode = [...verifyCode];
    for (let i = 0; i < CODE_LENGTH; i++) {
      newCode[i] = pasted[i] || "";
    }
    setVerifyCode(newCode);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    verifyInputsRef.current[focusIndex]?.focus();
  };
  const handleVerifySubmit = async () => {
    const fullCode = verifyCode.join("");
    if (fullCode.length < CODE_LENGTH) {
      setVerifyError("Preencha todos os 6 dígitos.");
      return;
    }
    setVerifyLoading(true);
    setVerifyError("");
    const res = await userService.verifyEmail(fullCode)
    if (res.status != 200) {
      console.log("erro")
      setVerifyError("Erro ao verificar e-mail");
      return
    }
    
    setVerifyLoading(false);
    setVerifySuccess("E-mail verificado com sucesso!");

    setShowVerify(false);
    setShowLogin(true);
  };
  const handleVerifyResend = () => {
    setVerifyCooldown(60);
    setVerifyCode(Array(CODE_LENGTH).fill(""));
    setVerifyError("");
    setVerifySuccess("");
    verifyInputsRef.current[0]?.focus();
  };
  const openVerifyModal = () => {
    setShowSignup(false);
    setVerifyCode(Array(CODE_LENGTH).fill(""));
    setVerifyError("");
    setVerifySuccess("");
    setVerifyLoading(false);
    setShowVerify(true);
  };
  const isVerifyFilled = verifyCode.every((d) => d !== "");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['plans'],
      queryFn: async () => {
        const faturePlan = await paymentService.findAllPlans()
        //setFatures(faturePlan.invoices)
        setPlans(faturePlan)
        return await paymentService.findAllPlans()
      },
      staleTime: Infinity
  })

  const handleSignIn = async(e) => {

    e.preventDefault()

    if (email && password) {
      const res = await userService.signIn({ email, password });
      setEmail('')
      setPassword('')
      if(res.status === 200) {
        navigate("/questoes");
      }
    }
  }

  const handleSignUp = async(e) => {

    e.preventDefault()

    if (email && password && name) {
      const res = await userService.createUser({ email, password, name });
      setEmail('')
      setPassword('')
      setName('')
      if(res.data.message == "Usuário criado com sucesso" || res.data.message == "Código já enviado, verifique seu email" || res.data.message == 'Código expirado, um novo foi enviado para seu email') {
        openVerifyModal()
      } else if(res.data.message == "Usuário ja cadastrado") {
        setShowSignup(false)
        setShowLogin(true)
      }
    }
  }

  return (
    <div className="landing">
      {/* Floating particles */}
      <div className="landing-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <img src={iconGreen} alt="CronoConcurso" className="landing-logo" />
            <span className="landing-brand-name">CronoConcurso</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Recursos</a>
            <a href="#plans">Planos</a>
            <a href="#testimonials">Depoimentos</a>
          </div>
          <div className="landing-nav-actions">
            <button className="landing-btn-ghost" onClick={() => setShowLogin(true)}>Entrar</button>
            <button className="landing-btn-primary" onClick={() => setShowSignup(true)}>Criar conta</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">🚀 Decolar</div>
          <h1 className="hero-title">
            Sua aprovação começa com um
            <span className="hero-highlight"> cronograma inteligente</span>
          </h1>
          <p className="hero-subtitle">
            Cole o link do edital e nossa IA cria seu plano de estudos personalizado em segundos. 
            Pare de perder tempo organizando — comece a estudar de verdade.
          </p>
          <div className="hero-cta-group">
            <button className="landing-btn-primary landing-btn-lg" onClick={() => {
              const auth = localStorage.getItem('auth')

              if (auth) {
                console.log(auth)
                navigate("/cronogramas")
                return
              }

              setShowSignup(true)
            }}>
              Começar agora — é grátis
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="landing-btn-outline landing-btn-lg" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Ver como funciona
            </button>
          </div>
          {/* <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">2.847</span>
              <span className="hero-stat-label">Usuários ativos</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">12.430</span>
              <span className="hero-stat-label">Cronogramas criados</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">94%</span>
              <span className="hero-stat-label">Satisfação</span>
            </div>
          </div> */}
        </div>
        <div className="hero-mockup">
          <div className="mockup-window">
            <div className="mockup-bar">
              <span /><span /><span />
            </div>
            <div className="mockup-body">
              <div className="mockup-card mockup-card-1">
                <div className="mockup-card-dot" style={{ background: "#43aa8b" }} />
                <div className="mockup-card-lines">
                  <div className="mockup-line" style={{ width: "80%" }} />
                  <div className="mockup-line" style={{ width: "60%" }} />
                </div>
                <div className="mockup-progress" style={{ width: "75%" }} />
              </div>
              <div className="mockup-card mockup-card-2">
                <div className="mockup-card-dot" style={{ background: "#1961ae" }} />
                <div className="mockup-card-lines">
                  <div className="mockup-line" style={{ width: "70%" }} />
                  <div className="mockup-line" style={{ width: "50%" }} />
                </div>
                <div className="mockup-progress" style={{ width: "45%" }} />
              </div>
              <div className="mockup-card mockup-card-3">
                <div className="mockup-card-dot" style={{ background: "#61007d" }} />
                <div className="mockup-card-lines">
                  <div className="mockup-line" style={{ width: "90%" }} />
                  <div className="mockup-line" style={{ width: "40%" }} />
                </div>
                <div className="mockup-progress" style={{ width: "90%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <h2 className="section-heading">Tudo que você precisa para <span className="hero-highlight">ser aprovado</span></h2>
        <p className="section-subheading">Ferramentas pensadas para maximizar seu tempo de estudo</p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-emoji">{f.emoji}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="landing-plans" id="plans">
        <h2 className="section-heading">Escolha seu <span className="hero-highlight">plano</span></h2>
        <p className="section-subheading">Comece grátis. Evolua quando quiser.</p>
        <div className="pricing-grid" style={{paddingBottom: "80px"}}>
            {data && data.map((p, i) => {
    
              const features = JSON.parse(p.resources)
    
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
                  <button className="btn-outline" onClick={() => setShowSignup(true)}>Adquirir</button>
                </div>
              )
    
            })}
          </div>
      </section>

      {/* Testimonials */}
      {/* <section className="landing-testimonials" id="testimonials">
        <h2 className="section-heading">Quem usa, <span className="hero-highlight">aprova</span></h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* CTA Final */}
      <section className="landing-final-cta">
        <div className="final-cta-glow" />
        <h2 className="final-cta-title">Pronto para transformar seus estudos?</h2>
        <p className="final-cta-sub">Junte-se a milhares de concurseiros que já estão estudando de forma inteligente.</p>
        <button className="landing-btn-primary landing-btn-lg" onClick={() => setShowSignup(true)}>
          Criar minha conta grátis
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-brand">
            <img src={iconGreen} alt="CronoConcurso" className="landing-logo" />
            <span className="landing-brand-name">CronoConcurso</span>
          </div>
          <p className="landing-footer-copy">© 2026 CronoConcurso. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="landing-modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="landing-modal" onClick={e => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => setShowLogin(false)}>✕</button>
            <img src={iconGreen} alt="CronoConcurso" className="landing-modal-logo" />
            <h2 className="landing-modal-title">Bem-vindo de volta!</h2>
            <p className="landing-modal-sub">Entre na sua conta para continuar</p>
            <form className="landing-form" onSubmit={handleSignIn}>
              <div className="landing-field">
                <label>E-mail</label>
                <input type="email" placeholder="seu@email.com" onChange={e => setEmail(e.target.value)} value={email} required />
              </div>
              <div className="landing-field">
                <label>Senha</label>
                <input type="password" placeholder="••••••••" required  onChange={e => setPassword(e.target.value)} value={password}/>
              </div>
              <button type="submit" className="landing-btn-primary landing-btn-full">Entrar</button>
            </form>
            <p className="landing-modal-switch">
              Não tem conta? <button onClick={() => { setShowLogin(false); setShowSignup(true); }}>Criar conta</button>
            </p>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="landing-modal-overlay" onClick={() => setShowSignup(false)}>
          <div className="landing-modal" onClick={e => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => setShowSignup(false)}>✕</button>
            <img src={iconGreen} alt="CronoConcurso" className="landing-modal-logo" />
            <h2 className="landing-modal-title">Crie sua conta</h2>
            <p className="landing-modal-sub">Comece a organizar seus estudos agora</p>
            <form className="landing-form" onSubmit={handleSignUp}>
              <div className="landing-field">
                <label>Nome completo</label>
                <input type="text" placeholder="João Carlos" required onChange={e => setName(e.target.value)} value={name} />
              </div>
              <div className="landing-field">
                <label>E-mail</label>
                <input type="email" placeholder="seu@email.com" required onChange={e => setEmail(e.target.value)} value={email} />
              </div>
              <div className="landing-field">
                <label>Senha</label>
                <input type="password" placeholder="Mínimo 6 caracteres" required minLength={6} onChange={e => setPassword(e.target.value)} value={password} />
              </div>
              <button type="submit" className="landing-btn-primary landing-btn-full">Criar conta grátis</button>
            </form>
            <p className="landing-modal-switch">
              Já tem conta? <button onClick={() => { setShowSignup(false); setShowLogin(true); }}>Entrar</button>
            </p>
          </div>
        </div>
      )}

      {/* Verify Email Modal */}
      {showVerify && (
        <div className="landing-modal-overlay" onClick={() => setShowVerify(false)}>
          <div className="landing-modal" onClick={e => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => setShowVerify(false)}>✕</button>
            <div className="verify-modal-icon">✉️</div>
            <h2 className="landing-modal-title">Verifique seu e-mail</h2>
            <p className="landing-modal-sub">Digite o código de 6 dígitos enviado para o seu e-mail</p>
            <div className="verify-modal-inputs">
              {verifyCode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { verifyInputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleVerifyChange(i, e.target.value)}
                  onKeyDown={(e) => handleVerifyKeyDown(i, e)}
                  onPaste={i === 0 ? handleVerifyPaste : undefined}
                  className={`verify-modal-digit ${digit ? "filled" : ""} ${verifyError ? "has-error" : ""} ${verifySuccess ? "has-success" : ""}`}
                  disabled={verifyLoading || !!verifySuccess}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            {verifyError && <p className="verify-modal-error">{verifyError}</p>}
            {verifySuccess && <p className="verify-modal-success">{verifySuccess}</p>}
            <button
              className="landing-btn-primary landing-btn-full"
              onClick={handleVerifySubmit}
              disabled={!isVerifyFilled || verifyLoading || !!verifySuccess}
            >
              {verifyLoading ? "Verificando..." : verifySuccess ? "Verificado ✓" : "Verificar código"}
            </button>
            <p className="landing-modal-switch">
              Não recebeu?{" "}
              <button onClick={handleVerifyResend} disabled={verifyCooldown > 0 || verifyLoading || !!verifySuccess}>
                {verifyCooldown > 0 ? `Reenviar em ${verifyCooldown}s` : "Reenviar código"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
