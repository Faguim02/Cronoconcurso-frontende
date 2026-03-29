import { useEffect, useState } from "react";
import UserMenuComponent from "../components/UserMenuComponent";
import "../styles/questoes.css";
import { QuestoesService } from "../services/QuestoesService/QuestoesService";
import { useNavigate } from "react-router-dom";
import logo from '../assets/cronoconcurso-horizontal-dark.svg'

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
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [usuario, setUsuario] = useState();
  const [questoes, setQuestoes] = useState([]); // ✅ inicia vazio, não com mock
  const [loading, setLoading] = useState(false); // ✅ estado de loading

  const filteredBancas = BANCAS.filter(b => b.toLowerCase().includes(bancaSearch.toLowerCase()));
  const filteredDisciplinas = DISCIPLINAS.filter(d => d.toLowerCase().includes(disciplinaSearch.toLowerCase()));
  const assuntoOptions = ASSUNTOS[disciplina] || [];
  const filteredAssuntos = assuntoOptions.filter(a => a.toLowerCase().includes(assuntoSearch.toLowerCase()));
  const navigate = useNavigate();

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

    // Restore última sessão
  const fetchLastSession = async () => {
    try {
      const result = await questoesService.getLastQuestionSession();
      if (result?.data?.questions?.length) {
        setQuestoes(result.data.questions);
        setStarted(true);
      }
    } catch {
      // sem sessão anterior, ignora
    }
  };
  fetchLastSession();

  }, []);

  // ✅ handleStart corrigido: loading, validação de retorno e erro tratado
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
        repeat: true
      });

      console.log(result);

      if (!result?.data?.atividades?.length) {
        alert("Não foi possível gerar as questões. Tente novamente.");
        return;
      }

      setQuestoes(result.data.atividades);
      setStarted(true);
      setAnswers({});
      setSubmitted(false);
    } catch (err) {
      alert("Erro ao gerar questões: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qId, alt) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: alt }));
  };

  const handleSubmit = () => setSubmitted(true);

  // ✅ score calculado sobre o state questoes, não sobre o mock
  const score = questoes.filter(q => answers[q.id] === q.correta).length;

  return (
    <div className="q-app-container">
      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo"> <img src={logo} alt="logo" width={200}/> </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-link" onClick={() => { navigate('/cronogramas') }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Meus Cronogramas
          </button>
          <button className="sidebar-link active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
            Questionários
          </button>
          {/* <button className="sidebar-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Configurações
          </button> */}
        </nav>
        <div className="sidebar-footer">
          <p className="sidebar-footer-text">Cronoconcurso v1.0 © 2026</p>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
            </button>
            <h1 className="header-title" style={{margin: 0}}>📝 Questionários</h1>
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

        <div className="page-content">
          {!started ? (
            <div className="q-config-section">
              <div className="q-config-card">
                <div className="q-config-header">
                  <div className="q-config-icon">📋</div>
                  <h2 className="q-config-title">Configurar Questionário</h2>
                  <p className="q-config-subtitle">Selecione os parâmetros para gerar suas questões de estudo</p>
                </div>

                <div className="q-form">
                  <div className="q-form-group">
                    <label className="q-label">Quantidade de questões</label>
                    <input className="q-input" type="number" min={1} max={50} value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} />
                  </div>

                  <div className="q-form-group">
                    <label className="q-label">Banca do concurso</label>
                    <div className="q-searchable-select">
                      <input
                        className="q-input"
                        type="text"
                        placeholder="Buscar banca..."
                        value={banca || bancaSearch}
                        onChange={e => { setBancaSearch(e.target.value); setBanca(""); setShowBancaDropdown(true); }}
                        onFocus={() => setShowBancaDropdown(true)}
                      />
                      {showBancaDropdown && (
                        <div className="q-dropdown">
                          {filteredBancas.map(b => (
                            <button key={b} className={`q-dropdown-item ${banca === b ? "selected" : ""}`} onClick={() => { setBanca(b); setBancaSearch(""); setShowBancaDropdown(false); }}>{b}</button>
                          ))}
                          {filteredBancas.length === 0 && <div className="q-dropdown-empty">Nenhuma banca encontrada</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="q-form-group">
                    <label className="q-label">Disciplina</label>
                    <div className="q-searchable-select">
                      <input
                        className="q-input"
                        type="text"
                        placeholder="Buscar disciplina..."
                        value={disciplina || disciplinaSearch}
                        onChange={e => { setDisciplinaSearch(e.target.value); setDisciplina(""); setAssunto(""); setShowDisciplinaDropdown(true); }}
                        onFocus={() => setShowDisciplinaDropdown(true)}
                      />
                      {showDisciplinaDropdown && (
                        <div className="q-dropdown">
                          {filteredDisciplinas.map(d => (
                            <button key={d} className={`q-dropdown-item ${disciplina === d ? "selected" : ""}`} onClick={() => { setDisciplina(d); setDisciplinaSearch(""); setShowDisciplinaDropdown(false); setAssunto(""); }}>{d}</button>
                          ))}
                          {filteredDisciplinas.length === 0 && <div className="q-dropdown-empty">Nenhuma disciplina encontrada</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="q-form-group">
                    <label className="q-label">Assunto</label>
                    <div className="q-searchable-select">
                      <input
                        className="q-input"
                        type="text"
                        placeholder={disciplina ? "Buscar assunto..." : "Selecione a disciplina primeiro"}
                        value={assunto || assuntoSearch}
                        disabled={!disciplina}
                        onChange={e => { setAssuntoSearch(e.target.value); setAssunto(""); setShowAssuntoDropdown(true); }}
                        onFocus={() => setShowAssuntoDropdown(true)}
                      />
                      {showAssuntoDropdown && disciplina && (
                        <div className="q-dropdown">
                          {filteredAssuntos.map(a => (
                            <button key={a} className={`q-dropdown-item ${assunto === a ? "selected" : ""}`} onClick={() => { setAssunto(a); setAssuntoSearch(""); setShowAssuntoDropdown(false); }}>{a}</button>
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

                  {/* ✅ Botão com loading state */}
                  <button
                    className="q-btn-start"
                    onClick={handleStart}
                    disabled={!banca || !disciplina || !dificuldade || loading}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    {loading ? "⏳ Gerando questões..." : "Iniciar Questionário"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="q-quiz-section">
              <div className="q-quiz-header">
                <div className="q-quiz-info">
                  <span className="q-quiz-tag">{banca}</span>
                  <span className="q-quiz-tag">{disciplina}</span>
                  <span className="q-quiz-tag">{dificuldade}</span>
                </div>
                <button className="q-btn-back" onClick={() => setStarted(false)}>← Voltar</button>
              </div>

              {/* ✅ Resultado usando questoes.length no lugar de MOCK_QUESTIONS.length */}
              {submitted && (
                <div className="q-result-card">
                  <div className="q-result-emoji">{score >= questoes.length * 0.7 ? "🎉" : score >= questoes.length * 0.4 ? "💪" : "📖"}</div>
                  <div className="q-result-text">
                    <h3>Resultado: {score}/{questoes.length}</h3>
                    <p>{score >= questoes.length * 0.7 ? "Excelente! Continue assim!" : score >= questoes.length * 0.4 ? "Bom! Mas pode melhorar." : "Revise o conteúdo e tente novamente!"}</p>
                  </div>
                  <div className="q-result-bar">
                    <div className="q-result-fill" style={{ width: `${(score / questoes.length) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* ✅ Renderiza questoes (state), não MOCK_QUESTIONS */}
              <div className="q-questions-list">
                {questoes.map((q, idx) => (
                  <div className={`q-question-card ${submitted ? (answers[q.id] === q.correta ? "correct" : "wrong") : ""}`} key={q.id}>
                    <div className="q-question-number">Questão {idx + 1}</div>
                    <div className="q-question-meta">
                      <span>{q.banca} • {q.ano_aproximado}</span>
                      <span className={`q-diff q-diff-${q.dificuldade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>{q.dificuldade}</span>
                    </div>
                    <p className="q-question-text">{q.enunciado}</p>
                    <div className="q-alternatives">
                      {Object.entries(q.alternativas).map(([key, val]) => {
                        let cls = "q-alt";
                        if (answers[q.id] === key) cls += " selected";
                        if (submitted) {
                          if (key === q.correta) cls += " correct";
                          else if (answers[q.id] === key) cls += " wrong";
                        }
                        return (
                          <button key={key} className={cls} onClick={() => handleAnswer(q.id, key)}>
                            <span className="q-alt-letter">{key}</span>
                            <span className="q-alt-text">{val}</span>
                          </button>
                        );
                      })}
                    </div>
                    {submitted && answers[q.id] !== q.correta && (
                      <div className="q-correct-answer">Resposta correta: <strong>{q.correta}</strong> — {q.alternativas[q.correta]}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* ✅ Botão de submit usando questoes.length */}
              {!submitted && (
                <button className="q-btn-submit" onClick={handleSubmit} disabled={Object.keys(answers).length < questoes.length}>
                  ✅ Finalizar e ver resultado ({Object.keys(answers).length}/{questoes.length} respondidas)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {(showBancaDropdown || showDisciplinaDropdown || showAssuntoDropdown) && (
        <div className="q-backdrop" onClick={() => { setShowBancaDropdown(false); setShowDisciplinaDropdown(false); setShowAssuntoDropdown(false); }} />
      )}
    </div>
  );
};

export default Questoes;