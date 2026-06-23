import { useState, useEffect, useRef } from "react";
import {
  LogIn, MapPin, Clock, CheckCircle2,
  AlertTriangle, Loader2, ChevronLeft, LogOut,
  Calendar, User, Shield,
} from "lucide-react";
import { API_URLS, authHeaders } from "../utils/api";

const API_URL = API_URLS.checkin;
const MAX_PHOTO_SIZE_MB = 25;
const MAX_PHOTO_SIZE = MAX_PHOTO_SIZE_MB * 1024 * 1024;

/* ── CSS global ─────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,300&family=Share+Tech+Mono&display=swap');
 
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes zoomIn {
    from { opacity: 0; transform: scale(.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes tick {
    0%,100% { opacity: 1; }
    50%     { opacity: 0; }
  }
  @keyframes scan {
    0%   { top: -4px; opacity: .8; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes ring-pulse {
    0%   { transform: scale(1);   opacity: .7; }
    100% { transform: scale(1.9); opacity: 0;  }
  }
  @keyframes stripe-move {
    from { background-position: 0 0; }
    to   { background-position: 40px 0; }
  }
  @keyframes success-pop {
    0%   { transform: scale(.5); opacity: 0; }
    70%  { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes confetti-fall {
    0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(60px)  rotate(360deg); opacity: 0; }
  }
 
  .ci-fade-1 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .08s both; }
  .ci-fade-2 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .18s both; }
  .ci-fade-3 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .28s both; }
  .ci-fade-4 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .38s both; }
 
  .ci-btn {
    position: relative;
    overflow: hidden;
    transition: transform .15s ease, box-shadow .2s ease;
  }
  .ci-btn:not(:disabled):hover { transform: translateY(-2px); }
  .ci-btn:not(:disabled):active { transform: translateY(0px) scale(.98); }
  .ci-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,.07) 0%, transparent 100%);
    pointer-events: none;
  }
 
  .diagonal-stripes {
    background-image: repeating-linear-gradient(
      -45deg, transparent, transparent 8px,
      rgba(170,17,17,.22) 8px, rgba(170,17,17,.22) 10px
    );
    animation: stripe-move 3s linear infinite;
  }
 
  .success-icon { animation: success-pop .5s cubic-bezier(.22,1,.36,1) both; }
 
  .scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(170,17,17,.6), transparent);
    animation: scan 2.5s ease-in-out infinite;
  }

  @media (max-width: 680px) {
    .ci-screen { overflow-x: hidden !important; }
    .ci-topbar-inner { height: auto !important; min-height: 58px !important; padding: 8px 12px !important; gap: 8px !important; }
    .ci-topbar-button { min-height: 42px !important; padding: 8px 10px !important; }
    .ci-topbar-label { display: none !important; }
    .ci-posto-badge { max-width: 45vw !important; min-height: 36px !important; padding: 6px 10px !important; }
    .ci-posto-badge span { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
    .ci-main { padding: 32px 16px 56px !important; gap: 30px !important; }
    .ci-clock-time { font-size: 46px !important; letter-spacing: 2px !important; }
    .ci-clock-date { font-size: 11px !important; letter-spacing: 1.4px !important; }
    .ci-card { border-radius: 14px !important; }
    .ci-card-body { padding: 28px 18px 30px !important; }
    .ci-card-title-row { align-items: flex-start !important; gap: 12px !important; }
    .ci-card-title { font-size: 28px !important; }
    .ci-info-box { padding: 14px !important; align-items: flex-start !important; }
    .ci-success { padding: 28px 16px !important; justify-content: flex-start !important; }
    .ci-success-card { padding: 22px 18px !important; }
    .ci-success-actions { flex-direction: column !important; }
    .ci-success-actions button { min-height: 44px !important; }
    .ci-info-row { align-items: flex-start !important; flex-direction: column !important; }
    .ci-info-row span:last-child { text-align: left !important; overflow-wrap: anywhere !important; }
  }
`;

/* ══════════════════════════════════════════════════════
   RELÓGIO AO VIVO
══════════════════════════════════════════════════════ */
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const dia = now.toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div style={{ textAlign: "center" }}>
      <div
        className="ci-clock-time"
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "clamp(52px, 10vw, 88px)",
          color: "#f0f0f0",
          letterSpacing: 6,
          lineHeight: 1,
          textShadow: "0 0 40px rgba(170,17,17,.35)",
        }}
      >
        {hh}
        <span
          style={{
            color: "#aa1111",
            animation: "tick 1s step-start infinite",
            display: "inline-block",
            width: "0.3em",
            textAlign: "center",
          }}
        >
          :
        </span>
        {mm}
        <span style={{ fontSize: "0.5em", color: "rgba(255,255,255,.3)", marginLeft: 10 }}>
          {ss}
        </span>
      </div>
      <p
        className="ci-clock-date"
        style={{
          fontFamily: "'Source Sans 3', sans-serif",
          fontSize: 13,
          color: "rgba(255,255,255,.3)",
          letterSpacing: 2,
          textTransform: "uppercase",
          marginTop: 8,
        }}
      >
        {dia}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TELA DE SUCESSO
══════════════════════════════════════════════════════ */
function SuccessScreen({ resposta, onVoltar, onLogout }) {
  const horario = new Date(resposta.horario);
  const horaFmt = horario.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dataFmt = horario.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (


    <div
      className="ci-success"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 32,
        gap: 0,
        animation: "zoomIn .4s cubic-bezier(.22,1,.36,1) both",
      }}
    >
      {/* anel pulsante */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div
          style={{
            position: "absolute",
            inset: -16,
            borderRadius: "50%",
            border: "2px solid rgba(34,197,94,.3)",
            animation: "ring-pulse 1.8s ease-out infinite",
          }}
        />
        <div
          className="success-icon"
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #16a34a, #052e16)",
            border: "2px solid rgba(34,197,94,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 48px rgba(34,197,94,.25)",
          }}
        >
          <CheckCircle2 size={44} color="#4ade80" strokeWidth={1.5} />
        </div>
      </div>

      <p
        style={{
          fontFamily: "'Source Sans 3', sans-serif",
          fontSize: 11,
          letterSpacing: 5,
          color: "rgba(74,222,128,.7)",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Check-in realizado
      </p>

      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(32px, 6vw, 52px)",
          color: "#f0f0f0",
          letterSpacing: 3,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        ENTRADA REGISTRADA
      </h2>

      {/* card de resumo */}
      <div
        className="ci-success-card"
        style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 16,
          padding: "28px 40px",
          width: "100%",
          maxWidth: 420,
          marginBottom: 36,
        }}
      >
        {/* faixa verde no topo */}
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, #16a34a, transparent)",
            borderRadius: 2,
            marginBottom: 24,
          }}
        />

        <InfoRow icon={<MapPin size={15} />} label="Posto" value={resposta.posto} />
        <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "14px 0" }} />
        <InfoRow icon={<Clock size={15} />} label="Horário" value={horaFmt} highlight />
        <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "14px 0" }} />
        <InfoRow icon={<Calendar size={15} />} label="Data" value={dataFmt} />
        <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "14px 0" }} />
        <InfoRow
          icon={<User size={15} />}
          label="Usuário"
          value={localStorage.getItem("email") || "—"}
        />
      </div>

      <div className="ci-success-actions" style={{ display: "flex", gap: 12, width: "100%", maxWidth: 420 }}>
        <button
          onClick={onVoltar}
          style={{
            flex: 1,
            padding: "12px 0",
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 10,
            color: "rgba(255,255,255,.6)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: 2,
            textTransform: "uppercase",
            fontFamily: "'Source Sans 3', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <ChevronLeft size={15} />
          Voltar
        </button>
        <button
          onClick={onLogout}
          style={{
            flex: 1,
            padding: "12px 0",
            background: "rgba(170,17,17,.15)",
            border: "1px solid rgba(170,17,17,.35)",
            borderRadius: 10,
            color: "#fca5a5",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: 2,
            textTransform: "uppercase",
            fontFamily: "'Source Sans 3', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, highlight }) {
  return (
    <div className="ci-info-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.3)" }}>
        {icon}
        <span style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Source Sans 3', sans-serif" }}>
          {label}
        </span>
      </div>
      <span
        style={{
          fontFamily: highlight ? "'Share Tech Mono', monospace" : "'Source Sans 3', sans-serif",
          fontSize: highlight ? 18 : 14,
          fontWeight: highlight ? 400 : 600,
          color: highlight ? "#4ade80" : "#e5e5e5",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════ */
export function Checkin({ posto, onNavegar, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [resposta, setResposta] = useState(null);  // CheckinResponseDTO
  const btnRef = useRef(null);

  const postoNome = posto?.nome || localStorage.getItem("postoNome") || "Posto";
  const postoId = posto?.id || localStorage.getItem("postoId");
  const [foto, setFoto] = useState(null);

  /* ── injeta CSS ─────────────────────────────────── */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const handleCheckin = async () => {

  if (!foto) {
    setErro("A foto é obrigatória.");
    return;
  }

  setErro(null);
  setLoading(true);

  try {

    const formData = new FormData();

    formData.append("postoId", postoId);
    formData.append("foto", foto);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || (res.status === 413 ? `A foto deve ter no máximo ${MAX_PHOTO_SIZE_MB} MB.` : `Erro ${res.status}`));
    }

    const data = await res.json();

    setResposta(data);

  } catch (e) {
    setErro(e.message || "Não foi possível registrar o check-in.");
  } finally {
    setLoading(false);
  }
};

  /* ════════════════════════════════════════════════════
     TELA DE SUCESSO
  ════════════════════════════════════════════════════ */
  if (resposta) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          fontFamily: "'Source Sans 3', sans-serif",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <BgGrid />
        <SuccessScreen
          resposta={resposta}
          onVoltar={() => onNavegar?.("selecionar-posto")}
          onLogout={onLogout}
        />
      </div>
    );
  }

  /* ════════════════════════════════════════════════════
     TELA PRINCIPAL
  ════════════════════════════════════════════════════ */
  return (
    <div
      className="ci-screen"
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        fontFamily: "'Source Sans 3', sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <BgGrid />

      {/* ── header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(10,10,10,.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(170,17,17,.2)",
        }}
      >
        <div className="diagonal-stripes" style={{ height: 3 }} />
        <div
          className="ci-topbar-inner"
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            className="ci-topbar-button"
            onClick={() => onNavegar?.("selecionar-posto")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.4)",
              cursor: "pointer",
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "'Source Sans 3', sans-serif",
              padding: "4px 0",
              transition: "color .15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fca5a5"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.4)"}
          >
            <ChevronLeft size={14} />
            <span className="ci-topbar-label">Postos</span>
          </button>

          {/* badge do posto */}
          <div
            className="ci-posto-badge"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              background: "rgba(170,17,17,.1)",
              border: "1px solid rgba(170,17,17,.25)",
              borderRadius: 20,
            }}
          >
            <MapPin size={12} color="#aa1111" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>
              {postoNome}
            </span>
          </div>

          <button
            className="ci-topbar-button"
            onClick={onLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "1px solid rgba(170,17,17,.3)",
              borderRadius: 6,
              padding: "5px 12px",
              color: "rgba(255,255,255,.35)",
              fontSize: 12,
              cursor: "pointer",
              letterSpacing: 1,
              fontFamily: "'Source Sans 3', sans-serif",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#aa1111"; e.currentTarget.style.color = "#fca5a5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(170,17,17,.3)"; e.currentTarget.style.color = "rgba(255,255,255,.35)"; }}
          >
            <LogOut size={12} />
            <span className="ci-topbar-label">SAIR</span>
          </button>
        </div>
      </header>

      {/* ── corpo ── */}
      <main
        className="ci-main"
        style={{
          flex: 1,
          maxWidth: 900,
          width: "100%",
          margin: "0 auto",
          padding: "60px 24px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── relógio ── */}
        <div className="ci-fade-1" style={{ width: "100%", textAlign: "center" }}>
          <LiveClock />
        </div>

        {/* ── divisor ── */}
        <div className="ci-fade-2" style={{ width: "100%", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(170,17,17,.3))" }} />
          <Shield size={14} color="rgba(170,17,17,.5)" />
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(170,17,17,.3), transparent)" }} />
        </div>

        {/* ── card principal ── */}
        <div
          className="ci-fade-3 ci-card"
          style={{
            width: "100%",
            maxWidth: 480,
            background: "rgba(255,255,255,.035)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,.5)",
            position: "relative",
          }}
        >
          {/* linha de scan animada */}
          <div className="scan-line" />

          {/* faixa topo */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #8b0000, #aa1111, #c0392b)" }} />

          <div className="ci-card-body" style={{ padding: "36px 40px 40px" }}>
            {/* ícone + título */}
            <div className="ci-card-title-row" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "rgba(170,17,17,.12)",
                  border: "1px solid rgba(170,17,17,.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LogIn size={26} color="#aa1111" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: "rgba(170,17,17,.7)", letterSpacing: 4, textTransform: "uppercase", marginBottom: 4 }}>
                  Registrar entrada
                </p>
                <h1
                  className="ci-card-title"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 32,
                    color: "#f0f0f0",
                    letterSpacing: 2,
                    lineHeight: 1,
                  }}
                >
                  CHECK-IN
                </h1>
              </div>
            </div>

            {/* info do posto */}
            <div
              className="ci-info-box"
              style={{
                padding: "16px 20px",
                background: "rgba(170,17,17,.07)",
                border: "1px solid rgba(170,17,17,.18)",
                borderRadius: 10,
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <MapPin size={16} color="#aa1111" />
              <div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: 3, textTransform: "uppercase" }}>
                  Posto selecionado
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0", marginTop: 2 }}>
                  {postoNome}
                </p>
              </div>
            </div>

            {/* usuário */}
            <div
              className="ci-info-box"
              style={{
                padding: "14px 20px",
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 10,
                marginBottom: 32,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <User size={15} color="rgba(255,255,255,.3)" />
              <div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,.25)", letterSpacing: 3, textTransform: "uppercase" }}>
                  Usuário
                </p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", marginTop: 2 }}>
                  {localStorage.getItem("email") || "—"}
                </p>
              </div>
            </div>

            {/* erro */}
            {erro && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "12px 16px",
                  background: "rgba(170,17,17,.1)",
                  border: "1px solid rgba(170,17,17,.3)",
                  borderLeft: "3px solid #aa1111",
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>{erro}</p>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 10,
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.3)"
                }}
              >
                Foto de entrada
              </label>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files[0];

                  if (file) {
                    if (file.size > MAX_PHOTO_SIZE) {
                      setFoto(null);
                      setErro(`A foto deve ter no máximo ${MAX_PHOTO_SIZE_MB} MB.`);
                      e.target.value = "";
                      return;
                    }

                    setErro(null);
                    setFoto(file);
                  }
                }}
                style={{
                  color: "#fff"
                }}
              />

              
            </div>

            {/* botão */}
            <button
              ref={btnRef}
              onClick={handleCheckin}
              disabled={loading}
              className="ci-btn"
              style={{
                width: "100%",
                padding: "16px 0",
                background: loading
                  ? "rgba(170,17,17,.3)"
                  : "linear-gradient(135deg, #6b0000 0%, #aa1111 50%, #c0392b 100%)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20,
                letterSpacing: 4,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                boxShadow: loading ? "none" : "0 6px 28px rgba(170,17,17,.4)",
                transition: "box-shadow .2s",
              }}
            >
              {loading
                ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> REGISTRANDO...</>
                : <><LogIn size={20} strokeWidth={1.5} /> REGISTRAR CHECK-IN</>
              }
            </button>

            <p
              style={{
                textAlign: "center",
                marginTop: 16,
                fontSize: 11,
                color: "rgba(255,255,255,.2)",
                letterSpacing: 1,
              }}
            >
              O horário será registrado automaticamente pelo servidor
            </p>
          </div>
        </div>

        {/* ── nota rodapé ── */}
        <p
          className="ci-fade-4"
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,.12)",
            letterSpacing: 3,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          CBMSC · Sistema de Controle de Presença
        </p>
      </main>
    </div>
  );
}

/* ── grade de fundo ─────────────────────────────────── */
function BgGrid() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(170,17,17,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(170,17,17,.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-20%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(100,0,0,.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  );
}
