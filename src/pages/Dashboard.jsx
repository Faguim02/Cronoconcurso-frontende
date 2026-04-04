import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "../styles/dashboard.css";
import { QuestoesService } from "../services/QuestoesService/QuestoesService";
import { useNavigate } from "react-router-dom";
import logo from '../assets/cronoconcurso-horizontal-dark.svg'
import UserMenuComponent from "../components/UserMenuComponent";
import { useQuery } from "@tanstack/react-query";

const questionService = new QuestoesService();

const CircularProgress = ({ value, total, color, label, count }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="dash-circular">
      <svg viewBox="0 0 128 128" className="dash-circular-svg">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="dash-circular-fill"
        />
      </svg>
      <div className="dash-circular-info">
        <span className="dash-circular-pct" style={{ color }}>{pct}%</span>
        <span className="dash-circular-label">{label}</span>
        <span className="dash-circular-count">{count} questões</span>
      </div>
    </div>
  );
};

// Converte o array de topics em dados por dia da semana para o gráfico de linha
const buildTimelineData = (topics) => {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const map = {};

  topics.forEach((topic) => {
    topic.history?.forEach((session) => {
      const date = new Date(session.createdAt);
      const day = days[date.getDay()];
      if (!map[day]) map[day] = { dia: day, acertos: 0, erros: 0 };
      map[day].acertos += session.score ?? 0;
      map[day].erros += (session.total ?? 0) - (session.score ?? 0);
    });
  });

  // Retorna na ordem correta da semana
  return days.filter((d) => map[d]).map((d) => map[d]);
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [overall, setOverall] = useState({ totalQuestions: 0, totalCorrect: 0, totalIncorrect: 0, accuracy: 0, totalSessions: 0 });
  const [topics, setTopics] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  
  const [usuario, setUsuario] = useState();

  const { data, isLoading, error: DashboardError, refetch } = useQuery({
    queryKey: ['dashboard'],
      queryFn: async () => {
        setLoading(true);
        const response = await questionService.findDashboardQuestions()
        setLoading(false);
        setOverall(response.data.overall);
        setTopics(response.data.topics);
        setTimelineData(buildTimelineData(response.data.topics));
      },
      staleTime: Infinity,
      // gcTime: 24 * 60 * 60 * 1000
  })

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

    // const fetchDashboard = async () => {
    //   try {
    //     setLoading(true);
    //     const response = await questionService.findDashboardQuestions();
    //     const data = response.data;

    //     setOverall(data.overall);
    //     setTopics(data.topics);
    //     setTimelineData(buildTimelineData(data.topics));
    //   } catch (err) {
    //     setError("Não foi possível carregar os dados do dashboard.");
    //     console.error(err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchDashboard();
  }, []);

  return (
    <div className="dash-container">
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
          <button className="sidebar-link" onClick={() => { navigate('/questoes') }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
            Questionários
          </button>
          <button className="sidebar-link active">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-line-icon lucide-chart-line"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            Dashboard
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

      <header className="header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
            </button>
            <h1 className="header-title" style={{margin: 0}}>📊 Dashboard</h1>
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

      <main className="dash-main">

        {/* Loading / Error states */}
        {loading && <p style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>Carregando dados...</p>}
        {error && <p style={{ textAlign: "center", padding: "2rem", color: "hsl(0,84%,60%)" }}>{error}</p>}

        {/* Empty state */}
        {!loading && !error && overall.totalQuestions === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", opacity: 0.6 }}>
            <p style={{ fontSize: "2rem" }}>📭</p>
            <p>Você ainda não respondeu nenhuma questão.</p>
            <button onClick={() => window.location.href = '/questoes'} style={{ marginTop: "1rem", padding: "0.6rem 1.4rem", cursor: "pointer" }}>
              Ir para Questionários
            </button>
          </div>
        )}

        {!loading && !error && overall.totalQuestions > 0 && (
          <>
            {/* Summary Cards */}
            <div className="dash-summary-row">
              <div className="dash-summary-card dash-summary-total">
                <span className="dash-summary-icon">📝</span>
                <div>
                  <div className="dash-summary-value">{overall.totalQuestions}</div>
                  <div className="dash-summary-label">Total de Questões</div>
                </div>
              </div>
              <div className="dash-summary-card dash-summary-correct">
                <span className="dash-summary-icon">✅</span>
                <div>
                  <div className="dash-summary-value">{overall.totalCorrect}</div>
                  <div className="dash-summary-label">Acertos</div>
                </div>
              </div>
              <div className="dash-summary-card dash-summary-wrong">
                <span className="dash-summary-icon">❌</span>
                <div>
                  <div className="dash-summary-value">{overall.totalIncorrect}</div>
                  <div className="dash-summary-label">Erros</div>
                </div>
              </div>
              <div className="dash-summary-card dash-summary-rate">
                <span className="dash-summary-icon">🎯</span>
                <div>
                  <div className="dash-summary-value">{overall.accuracy}%</div>
                  <div className="dash-summary-label">Taxa de Acerto</div>
                </div>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="dash-section">
              <h2 className="dash-section-title">🎯 Progresso Geral</h2>
              <div className="dash-circulars-row">
                <CircularProgress
                  value={overall.totalCorrect}
                  total={overall.totalQuestions}
                  color="hsl(142, 71%, 45%)"
                  label="Acertos"
                  count={overall.totalCorrect}
                />
                <CircularProgress
                  value={overall.totalIncorrect}
                  total={overall.totalQuestions}
                  color="hsl(0, 84%, 60%)"
                  label="Erros"
                  count={overall.totalIncorrect}
                />
              </div>
            </div>

            {/* Timeline Chart */}
            {timelineData.length > 0 && (
              <div className="dash-section">
                <h2 className="dash-section-title">📈 Linha do Tempo — Sessões por Dia</h2>
                <div className="dash-chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 40%, 91.4%)" />
                      <XAxis dataKey="dia" stroke="hsl(215, 16%, 47%)" fontSize={13} />
                      <YAxis stroke="hsl(215, 16%, 47%)" fontSize={13} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(210, 40%, 91.4%)",
                          borderRadius: 10,
                          fontSize: 13,
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="acertos" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={{ r: 5, fill: "hsl(142, 71%, 45%)" }} name="Acertos" />
                      <Line type="monotone" dataKey="erros" stroke="hsl(0, 84%, 60%)" strokeWidth={3} dot={{ r: 5, fill: "hsl(0, 84%, 60%)" }} name="Erros" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Per Topic */}
            <div className="dash-section">
              <h2 className="dash-section-title">📚 Desempenho por Tópico</h2>
              <div className="dash-subjects-list">
                {topics.map((t) => (
                  <div className="dash-subject-row" key={t.topic}>
                    <div className="dash-subject-name">{t.topic}</div>
                    <div className="dash-subject-bar-bg">
                      <div className="dash-subject-bar-fill" style={{ width: `${t.accuracy}%` }} />
                    </div>
                    <div className="dash-subject-stats">
                      <span className="dash-subject-correct">{t.totalCorrect}✓</span>
                      <span className="dash-subject-wrong">{t.totalIncorrect}✗</span>
                      <span className="dash-subject-pct">{t.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;