import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Building2, CheckCircle2, ClipboardCheck, ClipboardX,
  Clock, Edit2, Image, Loader2, LogOut, MapPin, Plus, RefreshCw,
  Save, Shield, ShieldCheck, Trash2, UserPlus, Users, Waves, X,
} from "lucide-react";
import { API_URLS, apiFileUrl, authHeaders } from "../utils/api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700&family=Share+Tech+Mono&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes stripe-move { from{background-position:0 0} to{background-position:40px 0} }
  @keyframes shimmer { 0%{left:-60%} 100%{left:130%} }
  @keyframes pulse-ring   { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.28)}  50%{box-shadow:0 0 0 7px rgba(34,197,94,0)} }
  @keyframes pulse-yellow { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.3)}  50%{box-shadow:0 0 0 7px rgba(251,191,36,0)} }
  .dash-fade-1{animation:fadeUp .45s cubic-bezier(.22,1,.36,1) .05s both}
  .dash-fade-2{animation:fadeUp .45s cubic-bezier(.22,1,.36,1) .13s both}
  .dash-fade-3{animation:fadeUp .45s cubic-bezier(.22,1,.36,1) .21s both}
  .dash-fade-4{animation:fadeUp .45s cubic-bezier(.22,1,.36,1) .29s both}
  .diagonal-stripes{background-image:repeating-linear-gradient(-45deg,transparent,transparent 8px,rgba(170,17,17,.22) 8px,rgba(170,17,17,.22) 10px);animation:stripe-move 3s linear infinite}
  .dash-btn{position:relative;overflow:hidden;transition:transform .15s ease,border-color .2s ease,box-shadow .2s ease}
  .dash-btn:not(:disabled):hover{transform:translateY(-2px)}
  .dash-btn:not(:disabled):active{transform:translateY(0) scale(.99)}
  .dash-btn::after{content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.10),transparent);transform:skewX(-20deg)}
  .dash-btn:not(:disabled):hover::after{animation:shimmer .5s ease forwards}
  .posto-online  {animation:pulse-ring   2s ease-in-out infinite}
  .posto-atrasado{animation:pulse-yellow 2s ease-in-out infinite}
  .dash-input:focus{outline:none;border-color:rgba(170,17,17,.65)!important;box-shadow:0 0 0 3px rgba(170,17,17,.12)}
  .dash-action-card, .dash-action-card * { box-sizing: border-box; min-width: 0; }
  .dash-action-card { overflow: visible !important; }
  .dash-action-card h3, .dash-action-card p { overflow-wrap: anywhere; word-break: normal; hyphens: auto; }
  .dash-crud-card{background:rgba(0,0,0,.20);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px;display:grid;gap:10px}
  .dash-crud-actions{display:flex;gap:8px;flex-wrap:wrap}

  @media (max-width: 760px) {
    .dash-shell { overflow-x: hidden !important; }
    .dash-topbar-inner { height: auto !important; min-height: 58px !important; padding: 8px 16px !important; gap: 12px !important; }
    .dash-brand-subtitle { display: none !important; }
    .dash-main { padding: 28px 16px 56px !important; }
    .dash-header-row { align-items: stretch !important; gap: 14px !important; }
    .dash-header-row > * { width: 100% !important; }
    .dash-header-row .dash-btn { width: 100% !important; min-height: 44px !important; }
    .dash-title { font-size: 38px !important; letter-spacing: 2px !important; }
    .dash-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
    .dash-tabs { overflow-x: auto !important; padding-bottom: 6px !important; }
    .dash-tabs .dash-btn { flex: 0 0 auto !important; min-height: 42px !important; }
    .dash-posto-grid, .dash-action-grid, .dash-admin-forms, .dash-bombeiro-form { grid-template-columns: 1fr !important; }
    .dash-posto-banner { align-items: flex-start !important; padding: 18px !important; }
    .dash-posto-banner h2 { font-size: 20px !important; }
    .dash-posto-card-title { font-size: 20px !important; }
    .dash-panel-body { padding: 16px !important; }
    .dash-info-line { align-items: flex-start !important; flex-direction: column !important; }
    .dash-info-line strong { text-align: left !important; }
    .dash-crud-actions .dash-btn { flex: 1 1 130px !important; min-height: 42px !important; }
  }

  @media (max-width: 430px) {
    .dash-metrics { grid-template-columns: 1fr !important; }
    .dash-topbar-inner { padding-inline: 12px !important; }
    .dash-brand-title { letter-spacing: 2px !important; }
    .dash-logout-text { display: none !important; }
  }
`;

const statusMeta = {
  CHECKIN:     { label:"Em operação",    color:"#22c55e", bg:"rgba(34,197,94,.12)",   border:"rgba(34,197,94,.38)",  icon:ClipboardCheck },
  CHECKOUT:    { label:"Turno encerrado",color:"#f59e0b", bg:"rgba(245,158,11,.12)",  border:"rgba(245,158,11,.35)", icon:ClipboardX     },
  SEM_REGISTRO:{ label:"Sem registro",   color:"#94a3b8", bg:"rgba(148,163,184,.10)", border:"rgba(148,163,184,.25)",icon:Clock          },
};

const postoCollator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });
const ordenarPorPosto = (a, b) => postoCollator.compare(a.postoNome || a.nome || "", b.postoNome || b.nome || "");
const usuariosPadrao = (usuarios) => usuarios.filter((u) => u.nivelAcesso !== "ADMIN").sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

export function Dashboard({ posto, onNavegar, onLogout }) {
  const nivelAcesso = localStorage.getItem("nivelAcesso");
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  if (nivelAcesso === "ADMIN") return <AdminDashboard onLogout={onLogout} />;
  return <OperationalDashboard posto={posto} onNavegar={onNavegar} onLogout={onLogout} />;
}

function AdminDashboard({ onLogout }) {
  const [postosStatus, setPostosStatus] = useState([]);
  const [postos, setPostos]             = useState([]);
  const [checkinsHoje, setCheckinsHoje] = useState([]);
  const [checkoutsHoje, setCheckoutsHoje] = useState([]);
  const [bombeiros, setBombeiros]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [erro, setErro]                 = useState("");
  const [sucesso, setSucesso]           = useState("");
  const [activeTab, setActiveTab]       = useState("CHECKINS");
  const [postoForm, setPostoForm]       = useState({ nome:"", descricao:"" });
  const [postoEdit, setPostoEdit]       = useState(null);
  const [postoAberto, setPostoAberto]   = useState(null);
  const [bombeiroForm, setBombeiroForm] = useState({ nome:"", email:"", cpf:"" });
  const [bombeiroEdit, setBombeiroEdit] = useState(null);

  const nomeUsuario = localStorage.getItem("nome") || "Administrador";
  const headers     = useMemo(() => authHeaders({ "Content-Type":"application/json" }), []);

  const carregarDados = useCallback(async () => {
    setLoading(true); setErro("");
    try {
      const [statusRes, postosRes, bombeirosRes, checkinsRes, checkoutsRes] = await Promise.all([
        fetch(API_URLS.checkStatus, { headers: authHeaders() }),
        fetch(API_URLS.postos,      { headers }),
        fetch(API_URLS.bombeiros,   { headers }),
        fetch(API_URLS.checkinsHoje, { headers: authHeaders() }),
        fetch(API_URLS.checkoutsHoje, { headers: authHeaders() }),
      ]);
      if (!statusRes.ok || !postosRes.ok || !bombeirosRes.ok || !checkinsRes.ok || !checkoutsRes.ok) throw new Error();
      setPostosStatus(await statusRes.json());
      setPostos(await postosRes.json());
      setBombeiros(await bombeirosRes.json());
      setCheckinsHoje(await checkinsRes.json());
      setCheckoutsHoje(await checkoutsRes.json());
    } catch { setErro("Não foi possível carregar os dados."); }
    finally  { setLoading(false); }
  }, [headers]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const totais = useMemo(() => postosStatus.reduce(
    (acc, p) => {
      acc.prevencoes += Number(p.prevencoesTotal || 0);
      acc.aguasVivas += Number(p.aguasVivasTotal || 0);
      if (p.status === "CHECKIN")  acc.emOperacao++;
      if (p.status === "CHECKOUT") acc.encerrados++;
      return acc;
    }, { prevencoes:0, aguasVivas:0, emOperacao:0, encerrados:0 }
  ), [postosStatus]);

  const postosFiltrados = useMemo(() => {
    const fonte = activeTab === "CHECKINS" ? checkinsHoje : checkoutsHoje;
    return [...fonte].sort(ordenarPorPosto);
  }, [checkinsHoje, checkoutsHoje, activeTab]);

  const postosOrdenados = useMemo(() => [...postos].sort(ordenarPorPosto), [postos]);
  const bombeirosPadrao = useMemo(() => usuariosPadrao(bombeiros), [bombeiros]);

  const criarPosto = async (e) => {
    e.preventDefault(); setErro(""); setSucesso("");
    if (!postoForm.nome.trim()) { setErro("Informe o nome do posto."); return; }
    setSaving(true);
    try {
      const res = await fetch(API_URLS.postos, { method:"POST", headers, body: JSON.stringify(postoForm) });
      if (!res.ok) throw new Error();
      setPostoForm({ nome:"", descricao:"" });
      setSucesso("Posto cadastrado com sucesso.");
      await carregarDados();
    } catch { setErro("Não foi possível cadastrar o posto."); }
    finally  { setSaving(false); }
  };

  const salvarPosto = async (e) => {
    e.preventDefault(); setErro(""); setSucesso("");
    if (!postoEdit?.nome?.trim()) { setErro("Informe o nome do posto."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URLS.postos}/${postoEdit.id}`, { method:"PUT", headers, body: JSON.stringify({ nome: postoEdit.nome, descricao: postoEdit.descricao || "" }) });
      if (!res.ok) throw new Error();
      setPostoEdit(null);
      setSucesso("Posto atualizado com sucesso.");
      await carregarDados();
    } catch { setErro("Não foi possível atualizar o posto."); }
    finally  { setSaving(false); }
  };

  const excluirPosto = async (posto) => {
    if (!window.confirm(`Excluir o posto "${posto.nome}"?`)) return;
    setErro(""); setSucesso(""); setSaving(true);
    try {
      const res = await fetch(`${API_URLS.postos}/${posto.id}`, { method:"DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      setSucesso("Posto excluído com sucesso.");
      await carregarDados();
    } catch { setErro("Não foi possível excluir o posto."); }
    finally  { setSaving(false); }
  };

  const criarBombeiro = async (e) => {
    e.preventDefault(); setErro(""); setSucesso("");
    if (!bombeiroForm.nome.trim())           { setErro("Informe o nome do guarda vidas."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bombeiroForm.email)) { setErro("Informe um email válido."); return; }
    if (!/^\d{11}$/.test(bombeiroForm.cpf))  { setErro("CPF deve ter 11 dígitos numéricos."); return; }
    setSaving(true);
    try {
      const res = await fetch(API_URLS.bombeiros, {
        method:"POST", headers,
        body: JSON.stringify({ nome: bombeiroForm.nome, email: bombeiroForm.email, cpf: bombeiroForm.cpf, nivelAcesso: "PADRAO" }),
      });
      if (!res.ok) throw new Error();
      setSucesso(`Usuário padrão cadastrado. Senha inicial: ${bombeiroForm.cpf.substring(0,5)}`);
      setBombeiroForm({ nome:"", email:"", cpf:"" });
      await carregarDados();
    } catch { setErro("Não foi possível cadastrar o usuário padrão."); }
    finally  { setSaving(false); }
  };

  const salvarBombeiro = async (e) => {
    e.preventDefault(); setErro(""); setSucesso("");
    if (!bombeiroEdit?.nome?.trim()) { setErro("Informe o nome do usuário."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bombeiroEdit.email)) { setErro("Informe um email válido."); return; }
    if (!/^\d{11}$/.test(bombeiroEdit.cpf)) { setErro("CPF deve ter 11 dígitos numéricos."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URLS.bombeiros}/${bombeiroEdit.id}`, {
        method:"PUT", headers,
        body: JSON.stringify({ nome: bombeiroEdit.nome, email: bombeiroEdit.email, cpf: bombeiroEdit.cpf, nivelAcesso:"PADRAO" }),
      });
      if (!res.ok) throw new Error();
      setBombeiroEdit(null);
      setSucesso("Usuário padrão atualizado com sucesso.");
      await carregarDados();
    } catch { setErro("Não foi possível atualizar o usuário padrão."); }
    finally  { setSaving(false); }
  };

  const excluirBombeiro = async (bombeiro) => {
    if (!window.confirm(`Excluir o usuário padrão "${bombeiro.nome}"?`)) return;
    setErro(""); setSucesso(""); setSaving(true);
    try {
      const res = await fetch(`${API_URLS.bombeiros}/${bombeiro.id}`, { method:"DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      setSucesso("Usuário padrão excluído com sucesso.");
      await carregarDados();
    } catch { setErro("Não foi possível excluir o usuário padrão."); }
    finally  { setSaving(false); }
  };

  return (
    <DashboardShell onLogout={onLogout}>
      <header className="dash-fade-1" style={{ marginBottom:30 }}>
        <div style={eyebrowStyle}><ShieldCheck size={13} color="#fca5a5" /><span>Administração</span></div>
        <div className="dash-header-row" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:20, flexWrap:"wrap" }}>
          <div>
            <h1 className="dash-title" style={titleStyle}>QUADRO DOS POSTOS</h1>
            <p style={subtitleStyle}>Bem-vindo, {nomeUsuario}. Registros diários de cada posto.</p>
          </div>
          <button className="dash-btn" onClick={carregarDados} disabled={loading} style={buttonStyle("ghost")}>
            {loading ? <Loader2 size={15} style={{ animation:"spin 1s linear infinite" }} /> : <RefreshCw size={15} />}
            Atualizar
          </button>
        </div>
      </header>

      {(erro || sucesso) && (
        <div className="dash-fade-1" style={messageStyle(erro ? "error" : "success")}>
          {erro ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{erro || sucesso}</span>
        </div>
      )}

      <section className="dash-fade-2 dash-metrics" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:14, marginBottom:28 }}>
        <MetricCard icon={<Building2     size={22}/>} label="Postos hoje"   value={postosStatus.length}  color="#38bdf8"/>
        <MetricCard icon={<ClipboardCheck size={22}/>} label="Em operação"  value={totais.emOperacao}    color="#22c55e"/>
        <MetricCard icon={<ClipboardX    size={22}/>} label="Encerrados"    value={totais.encerrados}    color="#f59e0b"/>
        <MetricCard icon={<Shield        size={22}/>} label="Prevenções"    value={totais.prevencoes}    color="#fb7185"/>
        <MetricCard icon={<Waves         size={22}/>} label="Águas-vivas"   value={totais.aguasVivas}    color="#34d399"/>
      </section>

      {/* ── ABAS ── */}
      <section className="dash-fade-3" style={{ marginBottom:28 }}>
        <div className="dash-tabs" style={{ display:"flex", gap:8, marginBottom:20 }}>
          <TabBtn label="CHECKINS"  count={checkinsHoje.length}  active={activeTab==="CHECKINS"}  color="#22c55e" onClick={()=>{setActiveTab("CHECKINS"); setPostoAberto(null);}} />
          <TabBtn label="CHECKOUTS" count={checkoutsHoje.length} active={activeTab==="CHECKOUTS"} color="#f59e0b" onClick={()=>{setActiveTab("CHECKOUTS"); setPostoAberto(null);}} />
        </div>

        {loading ? <LoadingBlock /> : postosFiltrados.length === 0 ? <EmptyTab tab={activeTab} /> : (
          <div className="dash-posto-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(255px,1fr))", gap:16 }}>
            {postosFiltrados.map(p => (
              <PostoQuadro
                key={p.postoId}
                posto={p}
                showYellow={activeTab==="CHECKINS" && p.checkinAtrasado}
                expanded={postoAberto === `${activeTab}-${p.postoId}-${p.ultimoEventoEm}`}
                onToggle={() => setPostoAberto(prev => {
                  const key = `${activeTab}-${p.postoId}-${p.ultimoEventoEm}`;
                  return prev === key ? null : key;
                })}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── CADASTROS ── */}
      <section className="dash-fade-4 dash-admin-forms" style={{ display:"grid", gridTemplateColumns:"minmax(280px,.9fr) minmax(280px,1.1fr)", gap:16 }}>
        <Panel title="Novo posto" subtitle="Cadastro rápido" icon={<MapPin size={15}/>}>
          <form onSubmit={criarPosto} style={{ display:"grid", gap:12 }}>
            <Field label="Nome do posto" value={postoForm.nome}      onChange={v=>setPostoForm(f=>({...f,nome:v}))}      placeholder="Ex.: Posto Central"/>
            <Field label="Descrição"     value={postoForm.descricao} onChange={v=>setPostoForm(f=>({...f,descricao:v}))} placeholder="Referência ou observação"/>
            <button className="dash-btn" disabled={saving} style={buttonStyle("primary")}>
              {saving ? <Loader2 size={15} style={{ animation:"spin 1s linear infinite" }}/> : <Plus size={15}/>}
              Cadastrar posto
            </button>
          </form>
        </Panel>

        <Panel title="Novo usuário padrão" subtitle={`${bombeirosPadrao.length} usuários padrão ativos`} icon={<UserPlus size={15}/>}>
          <form className="dash-bombeiro-form" onSubmit={criarBombeiro} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Nome completo"       value={bombeiroForm.nome} onChange={v=>setBombeiroForm(f=>({...f,nome:v}))} placeholder="Nome do guarda vidas"/>
            <Field label="Email" type="email"  value={bombeiroForm.email} onChange={v=>setBombeiroForm(f=>({...f,email:v}))} placeholder="guardavidas@email.com"/>
            <Field label="CPF (11 dígitos)"    value={bombeiroForm.cpf}  onChange={v=>setBombeiroForm(f=>({...f,cpf:v.replace(/\D/g,"").slice(0,11)}))} placeholder="00000000000"/>
            {bombeiroForm.cpf.length>=5 && (
              <div style={{ gridColumn:"1 / -1", padding:"10px 14px", background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.2)", borderRadius:9, fontSize:12, color:"rgba(251,191,36,.8)", display:"flex", alignItems:"center", gap:8 }}>
                <Shield size={13}/> Senha gerada automaticamente: <strong>{bombeiroForm.cpf.substring(0,5)}</strong>
              </div>
            )}
            <button className="dash-btn" disabled={saving} style={{ ...buttonStyle("primary"), gridColumn:"1 / -1" }}>
              {saving ? <Loader2 size={15} style={{ animation:"spin 1s linear infinite" }}/> : <UserPlus size={15}/>}
              Cadastrar guarda vidas
            </button>
          </form>
        </Panel>
      </section>

      <section className="dash-fade-4 dash-admin-forms" style={{ display:"grid", gridTemplateColumns:"minmax(280px,1fr) minmax(280px,1fr)", gap:16, marginTop:16 }}>
        <Panel title="Postos cadastrados" subtitle={`${postosOrdenados.length} postos ativos`} icon={<Building2 size={15}/>}>
          <div style={{ display:"grid", gap:10 }}>
            {postosOrdenados.length === 0 ? <p style={subtitleStyle}>Nenhum posto cadastrado.</p> : postosOrdenados.map((posto) => (
              <div className="dash-crud-card" key={posto.id}>
                {postoEdit?.id === posto.id ? (
                  <form onSubmit={salvarPosto} style={{ display:"grid", gap:10 }}>
                    <Field label="Nome do posto" value={postoEdit.nome} onChange={v=>setPostoEdit(f=>({...f,nome:v}))} placeholder="Nome do posto"/>
                    <Field label="Descrição" value={postoEdit.descricao || ""} onChange={v=>setPostoEdit(f=>({...f,descricao:v}))} placeholder="Descrição"/>
                    <div className="dash-crud-actions">
                      <button className="dash-btn" disabled={saving} style={buttonStyle("success")}><Save size={14}/>Salvar</button>
                      <button type="button" className="dash-btn" onClick={()=>setPostoEdit(null)} style={buttonStyle("ghost")}><X size={14}/>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <p style={{ color:"#f0f0f0", fontWeight:700 }}>{posto.nome}</p>
                      <p style={{ ...subtitleStyle, marginTop:2 }}>{posto.descricao || "Sem descrição."}</p>
                    </div>
                    <div className="dash-crud-actions">
                      <button type="button" className="dash-btn" onClick={()=>setPostoEdit(posto)} style={buttonStyle("warning")}><Edit2 size={14}/>Editar</button>
                      <button type="button" className="dash-btn" disabled={saving} onClick={()=>excluirPosto(posto)} style={buttonStyle("danger")}><Trash2 size={14}/>Excluir</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Usuários padrão" subtitle="Admin não altera outros administradores" icon={<Users size={15}/>}>
          <div style={{ display:"grid", gap:10 }}>
            {bombeirosPadrao.length === 0 ? <p style={subtitleStyle}>Nenhum usuário padrão cadastrado.</p> : bombeirosPadrao.map((bombeiro) => (
              <div className="dash-crud-card" key={bombeiro.id}>
                {bombeiroEdit?.id === bombeiro.id ? (
                  <form className="dash-bombeiro-form" onSubmit={salvarBombeiro} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <Field label="Nome" value={bombeiroEdit.nome} onChange={v=>setBombeiroEdit(f=>({...f,nome:v}))} placeholder="Nome"/>
                    <Field label="Email" type="email" value={bombeiroEdit.email || ""} onChange={v=>setBombeiroEdit(f=>({...f,email:v}))} placeholder="email"/>
                    <Field label="CPF" value={bombeiroEdit.cpf || ""} onChange={v=>setBombeiroEdit(f=>({...f,cpf:v.replace(/\D/g,"").slice(0,11)}))} placeholder="00000000000"/>
                    <div className="dash-crud-actions" style={{ gridColumn:"1 / -1" }}>
                      <button className="dash-btn" disabled={saving} style={buttonStyle("success")}><Save size={14}/>Salvar</button>
                      <button type="button" className="dash-btn" onClick={()=>setBombeiroEdit(null)} style={buttonStyle("ghost")}><X size={14}/>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <p style={{ color:"#f0f0f0", fontWeight:700 }}>{bombeiro.nome}</p>
                      <p style={{ ...subtitleStyle, marginTop:2 }}>{bombeiro.email || "Sem email"} · CPF {bombeiro.cpf}</p>
                    </div>
                    <div className="dash-crud-actions">
                      <button type="button" className="dash-btn" onClick={()=>setBombeiroEdit(bombeiro)} style={buttonStyle("warning")}><Edit2 size={14}/>Editar</button>
                      <button type="button" className="dash-btn" disabled={saving} onClick={()=>excluirBombeiro(bombeiro)} style={buttonStyle("danger")}><Trash2 size={14}/>Excluir</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </DashboardShell>
  );
}

function OperationalDashboard({ posto, onNavegar, onLogout }) {
  const nomeUsuario = localStorage.getItem("nome") || "Guarda vidas";
  return (
    <DashboardShell onLogout={onLogout}>
      <header className="dash-fade-1" style={{ marginBottom:34 }}>
        <div style={eyebrowStyle}><Shield size={13} color="#fca5a5"/><span>Operação</span></div>
        <h1 className="dash-title" style={titleStyle}>PAINEL OPERACIONAL</h1>
        <p style={subtitleStyle}>Bem-vindo, {nomeUsuario}. Selecione uma ação para o posto ativo.</p>
      </header>
      <section className="dash-fade-2" style={{ marginBottom:28 }}>
        <div className="dash-posto-banner" style={{ background:"rgba(255,255,255,.035)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:24, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"rgba(170,17,17,.12)", border:"1px solid rgba(170,17,17,.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <MapPin color="#aa1111"/>
          </div>
          <div>
            <p style={smallLabelStyle}>Posto ativo</p>
            <h2 style={{ margin:0, color:"#f0f0f0", fontSize:24 }}>{posto?.nome || localStorage.getItem("postoNome") || "Nenhum posto"}</h2>
            <p style={{ color:"rgba(255,255,255,.35)", marginTop:4 }}>{posto?.descricao || "Use a seleção de posto para vincular esta sessão."}</p>
          </div>
        </div>
      </section>
      <section className="dash-fade-3 dash-action-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px,1fr))", gap:16 }}>
        <ActionCard title="Check-in"    description="Registrar entrada no posto"          icon={<ClipboardCheck size={26}/>} onClick={()=>onNavegar?.("checkin")}/>
        <ActionCard title="Check-out"   description="Registrar saída do posto"            icon={<ClipboardX     size={26}/>} onClick={()=>onNavegar?.("checkout")}/>
        <ActionCard title="Trocar posto" description="Selecionar outro posto operacional" icon={<Building2      size={26}/>} onClick={()=>onNavegar?.("selecionar-posto")}/>
      </section>
    </DashboardShell>
  );
}

function PostoQuadro({ posto, showYellow, expanded, onToggle }) {
  const meta        = statusMeta[posto.status] || statusMeta.SEM_REGISTRO;
  const Icon        = meta.icon;
  const borderColor = showYellow ? "rgba(251,191,36,.7)" : meta.border;
  const pulseClass  = posto.status === "CHECKIN" ? (showYellow ? "posto-atrasado" : "posto-online") : "";
  const ultimoEvento = posto.ultimoEventoEm
    ? new Date(posto.ultimoEventoEm).toLocaleString("pt-BR",{ day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })
    : "Sem movimentação";

  return (
    <div role="button" tabIndex={0} onClick={onToggle} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onToggle?.(); }} style={{ background:"rgba(255,255,255,.035)", border:`1px solid ${borderColor}`, borderRadius:14, overflow:"hidden", minHeight:230, transition:"border-color .2s", cursor:"pointer" }}>
      <div style={{ height:4, background: showYellow ? "linear-gradient(90deg,#fbbf24,transparent)" : `linear-gradient(90deg,${meta.color},transparent)` }}/>
      <div style={{ padding:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:18 }}>
          <div className={pulseClass} style={{ width:48, height:48, borderRadius:13, background: showYellow?"rgba(251,191,36,.12)":meta.bg, border:`1px solid ${borderColor}`, display:"flex", alignItems:"center", justifyContent:"center", color: showYellow?"#fbbf24":meta.color }}>
            <Icon size={24}/>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
            <span style={{ height:28, padding:"5px 10px", borderRadius:20, background: showYellow?"rgba(251,191,36,.12)":meta.bg, border:`1px solid ${borderColor}`, color: showYellow?"#fbbf24":meta.color, fontSize:11, fontWeight:700, letterSpacing:1.4, textTransform:"uppercase" }}>
              {meta.label}
            </span>
            {showYellow && <span style={{ fontSize:10, color:"#fbbf24", letterSpacing:1, opacity:.8 }}>⚠ Check-in após 7h</span>}
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <p style={smallLabelStyle}>#{String(posto.postoId).padStart(3,"0")}</p>
          {posto.totalCheckinsHoje !== undefined && (
            <span style={{ fontSize:10, color:"rgba(255,255,255,.3)", letterSpacing:1 }}>{posto.totalCheckinsHoje}/2 checkins</span>
          )}
        </div>

        <h3 className="dash-posto-card-title" style={{ color:"#f0f0f0", fontSize:22, lineHeight:1.1, marginBottom:8 }}>{posto.postoNome}</h3>
        <p style={{ color:"rgba(255,255,255,.36)", fontSize:13, lineHeight:1.5, minHeight:38 }}>{posto.descricao || "Sem descrição."}</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:16 }}>
          <MiniStat label="Prevenções" value={posto.prevencoesTotal||0} color="#fb7185"/>
          <MiniStat label="Águas-vivas" value={posto.aguasVivasTotal||0} color="#34d399"/>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:7, color:"rgba(255,255,255,.32)", fontSize:12, marginTop:14 }}>
          <Clock size={13}/>{ultimoEvento}
        </div>

        {expanded && <PostoDetalhes posto={posto} />}
      </div>
    </div>
  );
}

function PostoDetalhes({ posto }) {
  const isCheckout = posto.status === "CHECKOUT";
  const horario = posto.ultimoEventoEm
    ? new Date(posto.ultimoEventoEm).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit", second:"2-digit" })
    : "Sem horário";

  return (
    <div style={{ marginTop:16, padding:"14px", borderRadius:10, background:"rgba(0,0,0,.22)", border:"1px solid rgba(255,255,255,.07)", display:"grid", gap:12 }}>
      <InfoLine icon={<Clock size={13}/>} label="Horário da ação" value={horario}/>
      {!isCheckout && (
        <InfoLine icon={<Users size={13}/>} label="Check-in feito por" value={posto.usuarioNome || posto.usuarioCpf || "Não informado"}/>
      )}
      {isCheckout && (
        <InfoLine icon={<Users size={13}/>} label="Check-out feito por" value={posto.usuarioNome || posto.usuarioCpf || "Não informado"}/>
      )}
      {isCheckout && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <MiniStat label="Prev. manhã" value={posto.prevencoesMatutinas||0} color="#f59e0b"/>
          <MiniStat label="Águas manhã" value={posto.aguasVivasMatutinas||0} color="#38bdf8"/>
          <MiniStat label="Prev. tarde" value={posto.prevencoesVespertinas||0} color="#fb923c"/>
          <MiniStat label="Águas tarde" value={posto.aguasVivasVespertinas||0} color="#34d399"/>
        </div>
      )}
      {posto.fotoUrl ? (
        <div style={{ borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,.08)", background:"rgba(255,255,255,.03)" }}>
          <img src={apiFileUrl(posto.fotoUrl)} alt={`Foto enviada pelo guarda no ${posto.status}`} style={{ width:"100%", maxHeight:220, objectFit:"cover", display:"block" }}/>
        </div>
      ) : (
        <InfoLine icon={<Image size={13}/>} label="Foto" value="Não disponível"/>
      )}
    </div>
  );
}

function InfoLine({ icon, label, value }) {
  return (
    <div className="dash-info-line" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, color:"rgba(255,255,255,.46)", fontSize:12 }}>
      <span style={{ display:"inline-flex", alignItems:"center", gap:7, color:"rgba(255,255,255,.32)", textTransform:"uppercase", letterSpacing:1.4 }}>{icon}{label}</span>
      <strong style={{ color:"#e5e5e5", fontWeight:600, textAlign:"right" }}>{value}</strong>
    </div>
  );
}

function TabBtn({ label, count, active, color, onClick }) {
  return (
    <button type="button" className="dash-btn" onClick={onClick} style={{ padding:"10px 22px", borderRadius:10, border: active?`1px solid ${color}`:"1px solid rgba(255,255,255,.1)", background: active?`${color}18`:"rgba(255,255,255,.04)", color: active?color:"rgba(255,255,255,.4)", fontFamily:"'Bebas Neue', sans-serif", fontSize:18, letterSpacing:2, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
      {label}
      <span style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:14, padding:"2px 8px", borderRadius:20, background: active?`${color}22`:"rgba(255,255,255,.06)", color: active?color:"rgba(255,255,255,.3)" }}>{count}</span>
    </button>
  );
}

function EmptyTab({ tab }) {
  const isCheckin = tab === "CHECKINS";
  return (
    <div style={{ minHeight:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:"rgba(255,255,255,.25)" }}>
      {isCheckin ? <ClipboardCheck size={32}/> : <ClipboardX size={32}/>}
      <p style={{ fontSize:13, letterSpacing:1 }}>{isCheckin?"Nenhum posto realizou check-in hoje.":"Nenhum posto realizou check-out hoje."}</p>
    </div>
  );
}

function DashboardShell({ children, onLogout }) {
  return (
    <div className="dash-shell" style={{ minHeight:"100vh", background:"#0d0d0d", color:"#fff", fontFamily:"'Source Sans 3', sans-serif", position:"relative", overflowX:"hidden" }}>
      <BgGrid/>
      <div style={{ position:"sticky", top:0, zIndex:20, background:"rgba(10,10,10,.86)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(170,17,17,.2)" }}>
        <div className="diagonal-stripes" style={{ height:3 }}/>
        <div className="dash-topbar-inner" style={{ maxWidth:1240, margin:"0 auto", padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"radial-gradient(circle at 35% 35%,#cc2222,#5c0000)", border:"1.5px solid rgba(170,17,17,.5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"#fff", fontFamily:"'Bebas Neue', sans-serif", fontSize:12, letterSpacing:1 }}>CBM</span>
            </div>
            <div>
              <p className="dash-brand-title" style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:16, letterSpacing:3, color:"#fff", lineHeight:1 }}>CBMSC</p>
              <p className="dash-brand-subtitle" style={{ fontSize:9, color:"rgba(255,255,255,.3)", letterSpacing:2 }}>SISTEMA OPERACIONAL</p>
            </div>
          </div>
          <button onClick={onLogout} className="dash-btn" style={buttonStyle("danger")}><LogOut size={14}/><span className="dash-logout-text">Sair</span></button>
        </div>
      </div>
      <main className="dash-main" style={{ maxWidth:1240, margin:"0 auto", padding:"42px 24px 80px", position:"relative", zIndex:1 }}>{children}</main>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div style={{ background:"rgba(255,255,255,.035)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:18, minHeight:110 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:`${color}16`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", color }}>{icon}</div>
        <span style={{ fontFamily:"'Share Tech Mono', monospace", fontSize:30, color }}>{value}</span>
      </div>
      <p style={smallLabelStyle}>{label}</p>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background:"rgba(0,0,0,.22)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, padding:"10px 12px" }}>
      <p style={{ color, fontFamily:"'Share Tech Mono', monospace", fontSize:22, lineHeight:1 }}>{value}</p>
      <p style={{ color:"rgba(255,255,255,.28)", fontSize:10, textTransform:"uppercase", letterSpacing:1, marginTop:4 }}>{label}</p>
    </div>
  );
}

function Panel({ children, title, subtitle, icon }) {
  return (
    <div style={{ background:"rgba(255,255,255,.035)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, overflow:"hidden" }}>
      <div style={{ padding:"15px 18px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ color:"#aa1111", display:"flex" }}>{icon}</span>
        <div>
          <p style={{ fontSize:14, fontWeight:700, color:"#f0f0f0" }}>{title}</p>
          <p style={{ fontSize:10, color:"rgba(255,255,255,.28)", letterSpacing:1.5, textTransform:"uppercase" }}>{subtitle}</p>
        </div>
      </div>
      <div className="dash-panel-body" style={{ padding:18 }}>{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type="text" }) {
  return (
    <label style={{ display:"grid", gap:7 }}>
      <span style={labelStyle}>{label}</span>
      <input className="dash-input" type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inputStyle}/>
    </label>
  );
}

function ActionCard({ title, description, icon, onClick }) {
  return (
    <button type="button" onClick={onClick} className="dash-btn dash-action-card" style={{ textAlign:"left", background:"rgba(255,255,255,.035)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:22, cursor:"pointer", color:"inherit", minHeight:138, width:"100%" }}>
      <div style={{ width:46, height:46, borderRadius:12, background:"rgba(170,17,17,.12)", border:"1px solid rgba(170,17,17,.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fca5a5", marginBottom:16 }}>{icon}</div>
      <h3 style={{ color:"#f0f0f0", marginBottom:6, fontSize:18, lineHeight:1.25 }}>{title}</h3>
      <p style={{ color:"rgba(255,255,255,.35)", fontSize:13, lineHeight:1.45 }}>{description}</p>
    </button>
  );
}

function LoadingBlock() {
  return (
    <div style={{ minHeight:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, color:"rgba(255,255,255,.35)" }}>
      <Loader2 size={30} color="#aa1111" style={{ animation:"spin 1s linear infinite" }}/>
      <p style={{ fontSize:12, letterSpacing:2, textTransform:"uppercase" }}>Carregando quadro...</p>
    </div>
  );
}

function BgGrid() {
  return (
    <>
      <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(170,17,17,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(170,17,17,.035) 1px,transparent 1px)", backgroundSize:"48px 48px", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"fixed", top:"-18%", right:"-12%", width:620, height:620, borderRadius:"50%", background:"radial-gradient(circle,rgba(120,0,0,.15) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>
    </>
  );
}

const titleStyle      = { fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(38px,6vw,66px)", color:"#f0f0f0", letterSpacing:3, lineHeight:1 };
const subtitleStyle   = { color:"rgba(255,255,255,.38)", fontSize:14, marginTop:8 };
const smallLabelStyle = { fontSize:10, color:"rgba(255,255,255,.35)", letterSpacing:2, textTransform:"uppercase", fontWeight:700 };
const labelStyle      = { fontSize:10, color:"rgba(255,255,255,.35)", letterSpacing:2, textTransform:"uppercase", fontWeight:700 };
const inputStyle      = { width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.28)", border:"1px solid rgba(255,255,255,.10)", borderRadius:9, color:"#f0f0f0", padding:"11px 12px", fontSize:14, fontFamily:"'Source Sans 3', sans-serif" };
const eyebrowStyle    = { display:"inline-flex", alignItems:"center", gap:8, marginBottom:14, padding:"5px 14px", borderRadius:20, background:"rgba(170,17,17,.12)", border:"1px solid rgba(170,17,17,.25)", color:"rgba(255,180,180,.75)", fontSize:11, letterSpacing:3, textTransform:"uppercase", fontWeight:700 };

function buttonStyle(kind) {
  const v = {
    primary:{ width:"100%", background:"linear-gradient(135deg,#6b0000 0%,#aa1111 50%,#c0392b 100%)", border:"none", color:"#fff", boxShadow:"0 6px 24px rgba(170,17,17,.32)" },
    ghost:  { background:"rgba(255,255,255,.045)", border:"1px solid rgba(255,255,255,.10)", color:"rgba(255,255,255,.72)" },
    danger: { background:"rgba(170,17,17,.12)",   border:"1px solid rgba(170,17,17,.32)",   color:"#fca5a5" },
    success:{ background:"rgba(34,197,94,.12)",   border:"1px solid rgba(34,197,94,.28)",   color:"#86efac" },
    warning:{ background:"rgba(245,158,11,.12)",  border:"1px solid rgba(245,158,11,.30)",  color:"#fbbf24" },
  };
  return { ...v[kind], minHeight:38, borderRadius:9, padding:"9px 12px", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", fontFamily:"'Source Sans 3', sans-serif" };
}

function messageStyle(kind) {
  const e = kind === "error";
  return { display:"flex", alignItems:"center", gap:10, padding:"12px 15px", background: e?"rgba(170,17,17,.10)":"rgba(21,128,61,.10)", border: e?"1px solid rgba(170,17,17,.30)":"1px solid rgba(34,197,94,.25)", borderLeft: e?"3px solid #aa1111":"3px solid #22c55e", borderRadius:9, color: e?"#fca5a5":"#86efac", marginBottom:24, fontSize:13 };
}
