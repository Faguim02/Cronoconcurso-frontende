import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, User, CreditCard, Users, Pencil, Trash2, Plus, Search } from "lucide-react";
import "../../styles/profile.css";
import { UsuarioService } from "../../services/Usuario/UsuarioService";
import { useQuery } from "@tanstack/react-query";
import { PaymentService } from "../../services/Payment/PaymentService";

const MOCK_USERS = [
  { id: "1", name: "João Carlos", email: "joao@email.com", isAdmin: true, dateCreated: "2025-06-15T10:00:00Z" },
  { id: "2", name: "Maria Silva", email: "maria@email.com", isAdmin: false, dateCreated: "2025-08-20T14:30:00Z" },
  { id: "3", name: "Pedro Santos", email: "pedro@email.com", isAdmin: false, dateCreated: "2025-10-05T09:15:00Z" },
  { id: "4", name: "Ana Oliveira", email: "ana@email.com", isAdmin: false, dateCreated: "2026-01-12T16:45:00Z" },
  { id: "5", name: "Lucas Pereira", email: "lucas@email.com", isAdmin: false, dateCreated: "2026-02-28T11:00:00Z" },
];

const MOCK_PLANS = [
  { id: "1", name: "Básico", price: 29.90, description: "Acesso a cronogramas e questões limitadas", duration: 1, active: true },
  { id: "2", name: "Pro", price: 49.90, description: "Cronogramas ilimitados, questões e desempenho", duration: 1, active: true },
  { id: "3", name: "Premium", price: 79.90, description: "Tudo do Pro + suporte prioritário e simulados", duration: 1, active: true },
  { id: "4", name: "Anual", price: 399.90, description: "Plano Premium com desconto anual", duration: 12, active: false },
];

const userService = new UsuarioService();
const paymentService = new PaymentService();

const Profile = () => {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);

  const showToast = (title, description, variant) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const [currentUser, setCurrentUser] = useState({
    id: "1", name: "João Carlos", email: "joao@email.com", isAdmin: true, dateCreated: "2025-06-15T10:00:00Z",
  });

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [users, setUsers] = useState(MOCK_USERS);
  const [plans, setPlans] = useState(MOCK_PLANS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planDuration, setPlanDuration] = useState("1");
  const [cronogramAccess, setCronogramAccess] = useState(false);
  const [cronogramAmount, setCronogramAmount] = useState(0);
  const [questionAmount, setQuestionAmount] = useState(0);
  const [planActive, setPlanActive] = useState(true);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const plans = await paymentService.findAllPlans();
      setPlans(plans);
      return plans;
    },
    staleTime: Infinity
  })

  const [confirmDialog, setConfirmDialog] = useState(null);

  const getInitials = (name) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const formatDate = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  useEffect(() => {
    const fetchUser = async () => {
      if (localStorage.getItem('user') === null) {
        const user = await userService.AboutUser();
        localStorage.setItem('user', JSON.stringify(user));
        setUsuario(user);
      } else {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user.user);
        setEditName(user.user.name);
        setEditEmail(user.user.email);
      }
    };
  
    fetchUser();
  }, []);

  const handleSaveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) { showToast("Erro", "Nome e email são obrigatórios.", "destructive"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) { showToast("Erro", "Email inválido.", "destructive"); return; }
    if (password && password !== confirmPassword) { showToast("Erro", "As senhas não coincidem.", "destructive"); return; }
    if (password && password.length < 6) { showToast("Erro", "A senha deve ter no mínimo 6 caracteres.", "destructive"); return; }
    setCurrentUser((prev) => ({ ...prev, name: editName, email: editEmail }));
    setPassword(""); setConfirmPassword("");
    showToast("Sucesso ✅", "Perfil atualizado com sucesso!");
  };

  const openPlanModal = (plan) => {
    if (plan) {
      setEditingPlan(plan); setPlanName(plan.name); setPlanPrice(plan.price.toString());
      setPlanDescription(plan.description); setPlanDuration(plan.duration.toString()); setPlanActive(plan.active);
    } else {
      setEditingPlan(null); setPlanName(""); setPlanPrice(""); setPlanDescription(""); setPlanDuration("1"); setPlanActive(true);
    }
    setPlanModalOpen(true);
  };

  const handleSavePlan = async() => {
    if (!planName.trim() || !planPrice || !planDescription.trim()) { showToast("Erro", "Preencha todos os campos do plano.", "destructive"); return; }
    if (editingPlan) {
      setPlans((prev) => prev.map((p) => p.id === editingPlan.id ? { ...p, name: planName, price: parseFloat(planPrice), description: planDescription, duration: parseInt(planDuration), active: planActive } : p));
      showToast("Sucesso ✅", "Plano atualizado!");
    } else {
      await paymentService.createPlan({ name: planName, price: parseFloat(planPrice), description: planDescription, codigo: planName.toLowerCase(), cronogramAccess, cronogramAmount, questionAmount });
      // setPlans((prev) => [...prev, { id: Date.now().toString(), name: planName, price: parseFloat(planPrice), description: planDescription, duration: parseInt(planDuration), active: planActive }]);
      refetch()
      showToast("Sucesso ✅", "Plano criado!");
    }
    setPlanModalOpen(false);
  };

  const handleDeletePlan = (id) => { setPlans((prev) => prev.filter((p) => p.id !== id)); showToast("Plano removido", "O plano foi excluído com sucesso."); };
  const handleToggleAdmin = (id) => { setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isAdmin: !u.isAdmin } : u))); showToast("Permissão atualizada", "O papel do usuário foi alterado."); };
  const handleDeleteUser = (id) => { setUsers((prev) => prev.filter((u) => u.id !== id)); showToast("Usuário removido", "O usuário foi excluído."); };

  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const ProfileCard = () => (
    <div className="profile-card">
      <div className="profile-card-header">
        <div className="avatar">{getInitials(currentUser.name)}</div>
        <div className="profile-info">
          <h2>{currentUser.name}</h2>
          <p className="email">{currentUser.email}</p>
          <p className="member-since">Membro desde {formatDate(currentUser.dateCreated)}</p>
          {currentUser.isAdmin && (
            <span className="badge badge-admin"><Shield size={12} /> Admin</span>
          )}
        </div>
      </div>
      <div className="profile-card-body">
        <div className="form-group">
          <label htmlFor="name">Nome</label>
          <input id="name" className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="form-input" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Nova Senha</label>
          <input id="password" type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input id="confirmPassword" type="password" className="form-input" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={handleSaveProfile}>Salvar Alterações</button>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="btn-back" style={{ display: "flex", alignItems: "center", padding: 0 }} onClick={() => navigate("/cronogramas")}>
          <ArrowLeft size={20} />
        </button>
        <h1>Meu Perfil</h1>
        {currentUser.isAdmin && (
          <span className="admin-header-badge"><Shield size={12} /> Painel Admin</span>
        )}
      </header>

      <main className="profile-main">
        {currentUser.isAdmin && (
          <div className="dev-toggle">
          <Shield size={16} />
          <span>Modo Admin</span>
          {/* <label className="toggle-switch">
            <input type="checkbox" checked={currentUser.isAdmin} onChange={(e) => setCurrentUser((prev) => ({ ...prev, isAdmin: e.target.checked }))} />
            <span className="toggle-slider" />
          </label> */}
        </div>
        )}

        {!currentUser.isAdmin ? (
          <div className="profile-card-wrapper"><ProfileCard /></div>
        ) : (
          <div className="tabs-container">
            <div className="tabs-list">
              <button className={`tab-trigger ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
                <User size={16} /> <span className="tab-label">Meu Perfil</span>
              </button>
              <button className={`tab-trigger ${activeTab === "plans" ? "active" : ""}`} onClick={() => setActiveTab("plans")}>
                <CreditCard size={16} /> <span className="tab-label">Planos</span>
              </button>
              <button className={`tab-trigger ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
                <Users size={16} /> <span className="tab-label">Usuários</span>
              </button>
            </div>

            {activeTab === "profile" && (
              <div className="profile-card-wrapper"><ProfileCard /></div>
            )}

            {activeTab === "plans" && (
              <div>
                <div className="section-header">
                  <h2>Planos de Assinatura</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => openPlanModal()}>
                    <Plus size={16} /> Novo Plano
                  </button>
                </div>
                <div className="plans-grid">
                  {plans.map((plan) => (
                    <div key={plan.id} className={`plan-card ${!plan.active ? "" : ""}`}>
                      <div className="plan-card-top">
                        <div>
                          <h3>{plan.name}</h3>
                          <p className="plan-desc">{plan.description}</p>
                        </div>
                        <span className={`badge ${plan.active ? "badge-active" : "badge-inactive"}`}>
                          {/* {plan.active ? "Ativo" : "Inativo"} */}Ativo
                        </span>
                      </div>
                      <p className="plan-price">
                        R$ {Number(plan.price).toFixed(2).toString().replace(".", ",")}
                        <span>/mês</span>
                      </p>
                      <div className="plan-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openPlanModal(plan)}>
                          <Pencil size={14} /> Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDialog({ title: `Excluir plano "${plan.name}"?`, desc: "Essa ação não pode ser desfeita.", onConfirm: () => { handleDeletePlan(plan.id); setConfirmDialog(null); } })}>
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <div className="users-header">
                  <h2>Todos os Usuários</h2>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input className="form-input" placeholder="Buscar por nome ou email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
                <div className="users-table-card">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th className="col-email">Email</th>
                        <th>Papel</th>
                        <th className="col-date">Criado em</th>
                        <th className="col-actions">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="user-cell">
                              <div className="avatar-sm">{getInitials(u.name)}</div>
                              <div>
                                <span className="user-name">{u.name}</span>
                                <span className="user-email-mobile">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="col-email">{u.email}</td>
                          <td>
                            <span className={`badge ${u.isAdmin ? "badge-role-admin" : "badge-role-user"}`}>
                              {u.isAdmin ? <><Shield size={12} /> Admin</> : "Usuário"}
                            </span>
                          </td>
                          <td className="col-date" style={{ color: "#6b7280" }}>{formatDate(u.dateCreated)}</td>
                          <td className="col-actions">
                            <div className="actions-cell">
                              <button className="btn btn-ghost" onClick={() => handleToggleAdmin(u.id)} title="Alternar admin">
                                <Shield size={16} />
                              </button>
                              <button className="btn btn-ghost text-danger" onClick={() => setConfirmDialog({ title: `Excluir "${u.name}"?`, desc: "O usuário será removido permanentemente.", onConfirm: () => { handleDeleteUser(u.id); setConfirmDialog(null); } })}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr className="empty-row">
                          <td colSpan={5}>Nenhum usuário encontrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Plan Modal */}
      {planModalOpen && (
        <div className="modal-overlay" onClick={() => setPlanModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingPlan ? "Editar Plano" : "Criar Novo Plano"}</h3>
            <p className="modal-desc">Preencha as informações do plano de assinatura.</p>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Plano</label>
                <input className="form-input" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Ex: Premium" />
              </div>
              <div className="form-group">
                  <label>Preço (R$)</label>
                  <input type="number" step="0.01" className="form-input" value={planPrice} onChange={(e) => setPlanPrice(e.target.value)} placeholder="49.90" />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input className="form-input" value={planDescription} onChange={(e) => setPlanDescription(e.target.value)} placeholder="Descrição do plano" />
              </div>
              <div className="dev-toggle" style={{ margin: 0, border: "none", background: "transparent", padding: 0 }}>
                <label className="toggle-switch">
                  <input type="checkbox" checked={activeTab} onChange={(e) => setActiveTab(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
                <span>Ativo</span>
              </div>
              <div className="dev-toggle" style={{ margin: 0, border: "none", background: "transparent", padding: 0 }}>
                <label className="toggle-switch">
                  <input type="checkbox" checked={cronogramAccess} onChange={(e) => setCronogramAccess(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
                <span>Acesso ao cronograma</span>
              </div>
              <div className="modal-row">
                {cronogramAccess && (
                  <div className="form-group">
                  <label>Cronogramas</label>
                  <input type="number" step="0.01" className="form-input" value={cronogramAmount} onChange={(e) => setCronogramAmount(e.target.value)} placeholder="49.90" />
                </div>
                )}
                <div className="form-group">
                  <label>Questões</label>
                  <input type="number" className="form-input" value={questionAmount} onChange={(e) => setQuestionAmount(e.target.value)} placeholder="1" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setPlanModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleSavePlan}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="confirm-overlay" onClick={() => setConfirmDialog(null)}>
          <div className="confirm-content" onClick={(e) => e.stopPropagation()}>
            <h3>{confirmDialog.title}</h3>
            <p>{confirmDialog.desc}</p>
            <div className="confirm-footer">
              <button className="btn btn-outline" onClick={() => setConfirmDialog(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmDialog.onConfirm}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item ${t.variant === "destructive" ? "destructive" : ""}`}>
            <p className="toast-title">{t.title}</p>
            <p className="toast-desc">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
