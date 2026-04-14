import { useEffect, useState } from "react";
import UserMenuComponent from "../components/UserMenuComponent";
import "../styles/questoes.css";
import { QuestoesService } from "../services/QuestoesService/QuestoesService";
import { useNavigate } from "react-router-dom";
import logo from '../assets/cronoconcurso-horizontal-dark.svg'

// ── Sound Effects (Web Audio API) ──
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playCorrectSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + i * 0.12);
    gain.gain.setValueAtTime(0.25, now + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.4);
  });
}

function playWrongSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc1.type = "square";
  osc1.frequency.setValueAtTime(311.13, now);
  osc1.frequency.linearRampToValueAtTime(293.66, now + 0.25);
  osc2.type = "sawtooth";
  osc2.frequency.setValueAtTime(155.56, now);
  osc2.frequency.linearRampToValueAtTime(146.83, now + 0.25);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.45);
  osc2.stop(now + 0.45);
}

const BANCAS = ["CESPE/CEBRASPE", "FCC", "FGV", "VUNESP", "IBFC", "CESGRANRIO", "Quadrix", "AOCP", "IDECAN"];
const DISCIPLINAS = ["Português", "Matemática", "Raciocínio Lógico", "Informática", "Direito Constitucional", "Direito Administrativo", "Direito Penal", "Direito Civil", "Administração Pública", "Contabilidade", "Economia", "Legislação Específica"];
const ASSUNTOS = {
  "Português": ["Interpretação de texto", "Concordância verbal", "Regência", "Crase", "Pontuação", "Classes de palavras"],
  "Matemática": ["Porcentagem", "Equações", "Geometria", "Probabilidade", "Estatística", "Juros compostos"],
  "Raciocínio Lógico": ["Proposições", "Tabela-verdade", "Lógica de argumentação", "Sequências", "Análise combinatória"],
  "Informática": ["Sistemas operacionais", "Redes de computadores", "Segurança da informação", "Planilhas eletrônicas", "Navegadores"],
  "Direito Constitucional": ["Direitos fundamentais", "Organização do Estado", "Poder Legislativo", "Poder Executivo", "Poder Judiciário"],
  "Direito Administrativo": ["Atos administrativos", "Licitações", "Contratos", "Servidores públicos", "Bens públicos"],
  "Direito Penal": ["Crimes contra a administração pública", "Crimes contra o patrimônio", "Princípios penais"],
  "Direito Civil": ["Contratos", "Obrigações", "Responsabilidade civil", "Direitos reais"],
  "Administração Pública": ["Gestão de pessoas", "Planejamento estratégico", "Governança", "Gestão de processos"],
  "Contabilidade": ["Balanço patrimonial", "DRE", "Lançamentos contábeis", "Análise de balanços"],
  "Economia": ["Macroeconomia", "Microeconomia", "Política fiscal", "Política monetária"],
  "Legislação Específica": ["Lei 8.112", "Lei 8.666", "Lei 14.133", "Lei 9.784"],
};
const DIFICULDADES = ["Fácil", "Média", "Difícil", "Aleatório"];

const questoesService = new QuestoesService();

const Questoes = () => {
  const navigate = useNavigate();

  // ── Sidebar & config state ──
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quantidade, setQuantidade] = useState(5);
  const [banca, setBanca] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [assunto, setAssunto] = useState("");
  const [dificuldade, setDificuldade] = useState("");
  const [bancaSearch, setBancaSearch] = useState("");
  const [disciplinaSearch, setDisciplinaSearch] = useState("");
  const [assuntoSearch, setAssuntoSearch] = useState("");
  const [showBancaDropdown, setShowBancaDropdown] = useState(false);
  const [showDisciplinaDropdown, setShowDisciplinaDropdown] = useState(false);
  const [showAssuntoDropdown, setShowAssuntoDropdown] = useState(false);

  // ── App / user state ──
  const [usuario, setUsuario] = useState();
  const [loading, setLoading] = useState(false);
  const [questoes, setQuestoes] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  // ── Quiz state (one-by-one, Duolingo style) ──
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAlt, setSelectedAlt] = useState(null);
  const [checked, setChecked] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [celebrateCorrect, setCelebrateCorrect] = useState(false);

  // ── Derived ──
  const filteredBancas = BANCAS.filter(b => b.toLowerCase().includes(bancaSearch.toLowerCase()));
  const filteredDisciplinas = DISCIPLINAS.filter(d => d.toLowerCase().includes(disciplinaSearch.toLowerCase()));
  const assuntoOptions = ASSUNTOS[disciplina] || [];
  const filteredAssuntos = assuntoOptions.filter(a => a.toLowerCase().includes(assuntoSearch.toLowerCase()));

  const currentQ = questoes[currentIndex];
  const progress = started && questoes.length > 0 ? (currentIndex / questoes.length) * 100 : 0;
  const totalCorrect = results.filter(r => r.isCorrect).length;

  // ── Load user & restore last session ──
  useEffect(() => {
    const fetchUser = async () => {
      if (localStorage.getItem('user') === null) {
        const user = await window.userService?.AboutUser?.();
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          setUsuario(user);
        }
      } else {
        
        const user = JSON.parse(localStorage.getItem('user'));
        setUsuario(user);
      }
    };
    fetchUser();

    const fetchLastSession = async () => {
      try {
        const result = await questoesService.getLastQuestionSession();
        if (result?.data?.questions?.length) {
          setQuestoes(result.data.questions);
          setSessionId(result.data.id);
          setStarted(true);
          setCurrentIndex(0);
          setSelectedAlt(null);
          setChecked(false);
          setHearts(5);
          setXp(0);
          setResults([]);
          setShowResult(false);
        }
      } catch {
        // no previous session, ignore
      }
    };
    fetchLastSession();
  }, []);

  // ── Hearts ran out mid-answer ──
  useEffect(() => {
    if (hearts <= 0 && checked) {
      setTimeout(() => setShowResult(true), 1200);
    }
  }, [hearts, checked]);

  // ── Handlers ──
  const handleStart = async () => {
    if (!banca || !disciplina || !dificuldade) return;
    setLoading(true);
    try {
      const result = await questoesService.generateQuestion({
        number: quantidade,
        banca,
        dicipline: disciplina,
        subject: assunto,
        dificuldade,
        repeat: true,
      });

      if (!result?.data?.atividades?.length) {
        alert("Não foi possível gerar as questões. Tente novamente.");
        return;
      }

      setQuestoes(result.data.atividades);
      setSessionId(result.data.sessionId);
      setStarted(true);
      setCurrentIndex(0);
      setSelectedAlt(null);
      setChecked(false);
      setHearts(5);
      setXp(0);
      setResults([]);
      setShowResult(false);
    } catch (err) {
      alert("Erro ao gerar questões: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    if (!selectedAlt || !currentQ) return;
    setChecked(true);
    const isCorrect = selectedAlt === currentQ.correta;

    if (isCorrect) {
      setXp(prev => prev + 10);
      setCelebrateCorrect(true);
      playCorrectSound();
      setTimeout(() => setCelebrateCorrect(false), 800);
    } else {
      setHearts(prev => Math.max(0, prev - 1));
      setShakeWrong(true);
      playWrongSound();
      setTimeout(() => setShakeWrong(false), 500);
    }

    setResults(prev => [...prev, {
      questionId: currentQ.id,
      selectedOption: selectedAlt,
      isCorrect,
    }]);
  };

  const handleContinue = () => {
    if (currentIndex + 1 >= questoes.length || hearts <= 0) {
      handleFinish();
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAlt(null);
      setChecked(false);
    }
  };

  const handleFinish = async () => {
    const score = results.filter(r => r.isCorrect).length;
    // include current answer if somehow not yet in results
    const finalResults = results;

    try {
      await questoesService.finishUserQuestionSession({
        sessionId,
        answer: finalResults,
        score,
      });
    } catch (err) {
      console.error("Erro ao finalizar sessão:", err);
    }

    setShowResult(true);
  };

  const handleQuit = () => {
    setStarted(false);
    setShowResult(false);
    setCurrentIndex(0);
    setSelectedAlt(null);
    setChecked(false);
    setResults([]);
    setQuestoes([]);
    setSessionId(null);
  };

  // ── Config Screen ──
  const renderConfig = () => (
    <div className="q-config-section">
      <div className="q-config-card">
        <div className="q-config-header">
          <h2 className="q-config-title">Configurar Questionário</h2>
          <p className="q-config-subtitle">Selecione os parâmetros para gerar suas questões de estudo</p>
        </div>

        <div className="q-form">

          <div className="q-form-group">
            <label className="q-label">Banca do concurso</label>
            <div className="q-searchable-select">
              <input className="q-input" type="text" placeholder="Buscar banca..." value={banca || bancaSearch}
                onChange={e => { setBancaSearch(e.target.value); setBanca(""); setShowBancaDropdown(true); }}
                onFocus={() => setShowBancaDropdown(true)} />
              {showBancaDropdown && (
                <div className="q-dropdown">
                  {filteredBancas.map(b => (
                    <button key={b} className={`q-dropdown-item ${banca === b ? "selected" : ""}`}
                      onClick={() => { setBanca(b); setBancaSearch(""); setShowBancaDropdown(false); }}>{b}</button>
                  ))}
                  {filteredBancas.length === 0 && <div className="q-dropdown-empty">Nenhuma banca encontrada</div>}
                </div>
              )}
            </div>
          </div>

          <div className="q-form-group">
            <label className="q-label">Disciplina</label>
            <div className="q-searchable-select">
              <input className="q-input" type="text" placeholder="Buscar disciplina..." value={disciplina || disciplinaSearch}
                onChange={e => { setDisciplinaSearch(e.target.value); setDisciplina(""); setAssunto(""); setShowDisciplinaDropdown(true); }}
                onFocus={() => setShowDisciplinaDropdown(true)} />
              {showDisciplinaDropdown && (
                <div className="q-dropdown">
                  {filteredDisciplinas.map(d => (
                    <button key={d} className={`q-dropdown-item ${disciplina === d ? "selected" : ""}`}
                      onClick={() => { setDisciplina(d); setDisciplinaSearch(""); setShowDisciplinaDropdown(false); setAssunto(""); }}>{d}</button>
                  ))}
                  {filteredDisciplinas.length === 0 && <div className="q-dropdown-empty">Nenhuma disciplina encontrada</div>}
                </div>
              )}
            </div>
          </div>

          <div className="q-form-group">
            <label className="q-label">Assunto</label>
            <div className="q-searchable-select">
              <input className="q-input" type="text"
                placeholder={disciplina ? "Buscar assunto..." : "Selecione a disciplina primeiro"}
                value={assunto || assuntoSearch} disabled={!disciplina}
                onChange={e => { setAssuntoSearch(e.target.value); setAssunto(""); setShowAssuntoDropdown(true); }}
                onFocus={() => setShowAssuntoDropdown(true)} />
              {showAssuntoDropdown && disciplina && (
                <div className="q-dropdown">
                  {filteredAssuntos.map(a => (
                    <button key={a} className={`q-dropdown-item ${assunto === a ? "selected" : ""}`}
                      onClick={() => { setAssunto(a); setAssuntoSearch(""); setShowAssuntoDropdown(false); }}>{a}</button>
                  ))}
                  {filteredAssuntos.length === 0 && <div className="q-dropdown-empty">Nenhum assunto encontrado</div>}
                </div>
              )}
            </div>
          </div>

          <div className="q-form-group">
            <label className="q-label">Dificuldade</label>
            <select className="q-select" value={dificuldade} onChange={e => setDificuldade(e.target.value)}>
              <option value="">Selecione...</option>
              {DIFICULDADES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button className="q-btn-start" onClick={handleStart} disabled={!banca || !disciplina || !dificuldade || loading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            {loading ? "⏳ Gerando questões..." : "Iniciar Questionário"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Result Screen ──
  const renderResult = () => {
    const pct = questoes.length > 0 ? Math.round((totalCorrect / questoes.length) * 100) : 0;
    const isGreat = pct >= 80;
    const isOk = pct >= 50;
    return (
      <div className="duo-result-wrapper">
        <div className={`duo-result-card ${isGreat ? "great" : isOk ? "ok" : "bad"}`}>
          <div className="duo-result-mascot">{isGreat ? "🎉" : isOk ? "💪" : "😢"}</div>
          <h2 className="duo-result-title">{isGreat ? "Incrível!" : isOk ? "Bom trabalho!" : "Continue praticando!"}</h2>

          <div className="duo-result-stats">
            <div className="duo-stat">
              <span className="duo-stat-value">{totalCorrect}/{questoes.length}</span>
              <span className="duo-stat-label">Acertos</span>
            </div>
            <div className="duo-stat">
              <span className="duo-stat-value duo-xp-color">+{xp}</span>
              <span className="duo-stat-label">XP ganho</span>
            </div>
            <div className="duo-stat">
              <span className="duo-stat-value">{pct}%</span>
              <span className="duo-stat-label">Precisão</span>
            </div>
          </div>

          <div className="duo-result-bar-track">
            <div className="duo-result-bar-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="duo-review">
            {questoes.map((q, i) => {
              const r = results[i];
              if (!r) return null;
              return (
                <div key={q.id} className={`duo-review-item ${r.isCorrect ? "correct" : "wrong"}`}>
                  <span className="duo-review-icon">{r.isCorrect ? "✅" : "❌"}</span>
                  <span className="duo-review-text">{q.enunciado}</span>
                </div>
              );
            })}
          </div>

          <div className="duo-result-actions">
            <button className="duo-btn-retry" onClick={handleStart}>TENTAR NOVAMENTE</button>
            <button className="duo-btn-quit" onClick={handleQuit}>VOLTAR AO MENU</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Quiz Screen (one-by-one) ──
  const renderQuiz = () => {
    if (!currentQ) return null;
    const isCorrect = checked && selectedAlt === currentQ.correta;
    const isWrong = checked && selectedAlt !== currentQ.correta;

    return (
      <div className="duo-quiz-wrapper">
        {/* Top bar */}
        <div className="duo-topbar">
          <button className="duo-quit-btn" onClick={handleQuit} title="Sair">✕</button>
          <div className="duo-progress-track">
            <div className="duo-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="duo-hearts">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`duo-heart ${i < hearts ? "alive" : "dead"}`}>
                {i < hearts ? "❤️" : "🩶"}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="duo-stats-row">
          <div className="duo-chip duo-xp-chip">⚡ {xp} XP</div>
          {streak > 0 && <div className="duo-chip duo-streak-chip">🔥 {streak} dias</div>}
          <div className="duo-chip duo-q-chip">Questão {currentIndex + 1}/{questoes.length}</div>
        </div>

        {/* Question */}
        <div className={`duo-question-area ${shakeWrong ? "shake" : ""} ${celebrateCorrect ? "celebrate" : ""}`}>
          <div className="duo-question-meta">
            <span className="duo-meta-tag">{currentQ.banca} • {currentQ.ano_aproximado}</span>
            <span className={`duo-meta-diff duo-meta-diff-${currentQ.dificuldade?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
              {currentQ.dificuldade}
            </span>
          </div>
          <p className="duo-question-text">{currentQ.enunciado}</p>

          <div className="duo-alternatives">
            {Object.entries(currentQ.alternativas).map(([key, val]) => {
              let cls = "duo-alt";
              if (selectedAlt === key && !checked) cls += " selected";
              if (checked && key === currentQ.correta) cls += " correct";
              if (checked && selectedAlt === key && key !== currentQ.correta) cls += " wrong";
              return (
                <button key={key} className={cls} onClick={() => !checked && setSelectedAlt(key)} disabled={checked}>
                  <span className="duo-alt-letter">{key}</span>
                  <span className="duo-alt-text">{val}</span>
                  {checked && key === currentQ.correta && <span className="duo-alt-icon">✅</span>}
                  {checked && selectedAlt === key && key !== currentQ.correta && <span className="duo-alt-icon">❌</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom feedback bar */}
        <div className={`duo-bottom-bar ${checked ? (isCorrect ? "correct" : "wrong") : ""}`}>
          {checked && isCorrect && (
            <div className="duo-feedback">
              <span className="duo-feedback-icon">🎉</span>
              <div>
                <strong>Excelente!</strong>
                <span className="duo-feedback-xp">+10 XP</span>
              </div>
            </div>
          )}
          {checked && isWrong && (
            <div className="duo-feedback">
              <span className="duo-feedback-icon">😞</span>
              <div>
                <strong>Resposta correta: {currentQ.correta}</strong>
                <span className="duo-feedback-detail">
                  {currentQ.alternativas[currentQ.correta || currentQ.alternativas]}
                </span>
              </div>
            </div>
          )}
          <button
            className={`duo-action-btn ${checked ? "continue" : "check"}`}
            onClick={checked ? handleContinue : handleCheck}
            disabled={!selectedAlt}
          >
            {checked ? "CONTINUAR" : "VERIFICAR"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="q-app-container">
      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo"><img src={logo} alt="logo" width={200} /></div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-link" onClick={() => navigate('/cronogramas')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Meus Cronogramas
          </button>
          <button className="sidebar-link active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
            Questionários
          </button>
          <button className="sidebar-link" onClick={() => navigate('/dashboard')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            Dashboard
          </button>
        </nav>
        <div className="sidebar-footer">
          <p className="sidebar-footer-text">Cronoconcurso v1.0 © 2026</p>
        </div>
      </aside>

      <div className="main-content">
        {/* Header: only show when not in active quiz */}
        {(!started || showResult) && (
          <header className="header">
            <div className="header-left">
              <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
              </button>
              <h1 className="header-title" style={{ margin: 0 }}>📝 Questionários</h1>
            </div>
            <div className="header-right">
              <UserMenuComponent name={usuario && String(usuario.user.name)}>
                <div className="user-menu">
                  <div className="user-avatar">{usuario && String(usuario.user.name).slice(0, 1)}</div>
                  <div className="user-info">
                    <span className="user-name">{usuario && String(usuario.user.name)}</span>
                    <span className="user-role">Plano {usuario && usuario.plan ? String(usuario.plan.plan.name) : "Free"}</span>
                  </div>
                </div>
              </UserMenuComponent>
            </div>
          </header>
        )}

        <div className={started && !showResult ? "duo-fullscreen" : "page-content"}>
          {showResult
            ? renderResult()
            : started
              ? renderQuiz()
              : renderConfig()
          }
        </div>
      </div>

      {(showBancaDropdown || showDisciplinaDropdown || showAssuntoDropdown) && (
        <div className="q-backdrop" onClick={() => {
          setShowBancaDropdown(false);
          setShowDisciplinaDropdown(false);
          setShowAssuntoDropdown(false);
        }} />
      )}
    </div>
  );
};

export default Questoes;