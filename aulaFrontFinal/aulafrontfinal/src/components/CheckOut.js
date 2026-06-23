import { useState, useEffect, useRef } from "react";
import {
  LogOut, MapPin, Camera, CheckCircle2, AlertTriangle,
  Loader2, ChevronLeft, Plus, Minus, Upload, X,
  Sun, Sunset, Waves, Shield, User, ImagePlus,
} from "lucide-react";
import { API_URLS, authHeaders } from "../utils/api";
 
const API_URL = API_URLS.checkout;
const MAX_PHOTO_SIZE_MB = 25;
const MAX_PHOTO_SIZE = MAX_PHOTO_SIZE_MB * 1024 * 1024;
 
/* ── CSS ────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700&family=Share+Tech+Mono&display=swap');
 
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes zoomIn {
    from { opacity: 0; transform: scale(.9); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes ring-pulse {
    0%   { transform: scale(1);   opacity: .6; }
    100% { transform: scale(2);   opacity: 0;  }
  }
  @keyframes stripe-move {
    from { background-position: 0 0; }
    to   { background-position: 40px 0; }
  }
  @keyframes shimmer {
    0%   { left: -60%; }
    100% { left: 130%; }
  }
  @keyframes success-pop {
    0%   { transform: scale(.5); opacity: 0; }
    70%  { transform: scale(1.12); }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes photo-reveal {
    from { opacity: 0; transform: scale(.95); }
    to   { opacity: 1; transform: scale(1); }
  }
 
  .co-fade-1 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .06s both; }
  .co-fade-2 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .14s both; }
  .co-fade-3 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .22s both; }
  .co-fade-4 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .30s both; }
  .co-fade-5 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .38s both; }
 
  .co-btn {
    position: relative; overflow: hidden;
    transition: transform .15s ease, box-shadow .2s ease;
  }
  .co-btn:not(:disabled):hover  { transform: translateY(-2px); }
  .co-btn:not(:disabled):active { transform: translateY(0) scale(.98); }
  .co-btn::after {
    content: '';
    position: absolute; top: 0; left: -60%;
    width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent);
    transform: skewX(-20deg);
  }
  .co-btn:not(:disabled):hover::after { animation: shimmer .5s ease forwards; }
 
  .counter-btn {
    transition: background .15s, transform .1s;
  }
  .counter-btn:hover  { filter: brightness(1.2); }
  .counter-btn:active { transform: scale(.9); }
 
  .drop-zone {
    transition: border-color .2s, background .2s;
    cursor: pointer;
  }
  .drop-zone:hover {
    border-color: rgba(170,17,17,.6) !important;
    background: rgba(170,17,17,.07) !important;
  }
  .drop-zone.drag-over {
    border-color: #aa1111 !important;
    background: rgba(170,17,17,.12) !important;
  }
 
  .diagonal-stripes {
    background-image: repeating-linear-gradient(
      -45deg, transparent, transparent 8px,
      rgba(170,17,17,.22) 8px, rgba(170,17,17,.22) 10px
    );
    animation: stripe-move 3s linear infinite;
  }
 
  .success-icon { animation: success-pop .5s cubic-bezier(.22,1,.36,1) both; }
  .photo-reveal { animation: photo-reveal .35s ease both; }
  .co-screen, .co-screen * { box-sizing: border-box; }
  .co-main { max-width: min(720px, calc(100vw - 32px)) !important; }
  .co-counter-grid, .co-summary-grid, .co-success-grid { min-width: 0; }
  .co-section { overflow: visible !important; }
  .co-btn { white-space: normal; line-height: 1.15; min-height: 58px; padding-left: 14px !important; padding-right: 14px !important; }
  .co-counter-grid > *, .co-summary-grid > * { min-width: 0; }
  
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

  @media (max-width: 680px) {
    .co-screen { overflow-x: hidden !important; }
    .co-topbar-inner { height: auto !important; min-height: 58px !important; padding: 8px 12px !important; gap: 8px !important; }
    .co-topbar-button { min-height: 42px !important; padding: 8px 10px !important; }
    .co-topbar-label { display: none !important; }
    .co-posto-badge { max-width: 45vw !important; min-height: 36px !important; padding: 6px 10px !important; }
    .co-posto-badge span { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
    .co-main { padding: 32px 16px 56px !important; }
    .co-title-wrap { margin-bottom: 28px !important; }
    .co-title-row { align-items: flex-start !important; gap: 12px !important; }
    .co-title { font-size: 32px !important; letter-spacing: 2px !important; }
    .co-section { border-radius: 14px !important; margin-bottom: 22px !important; }
    .co-section-header { padding: 14px 16px !important; }
    .co-section-body { padding: 16px !important; }
    .co-counter-grid, .co-summary-grid, .co-success-grid { grid-template-columns: 1fr !important; }
    .co-drop-zone { padding: 28px 16px !important; }
    .co-success { padding: 28px 16px !important; justify-content: flex-start !important; }
    .co-success-card { padding: 22px 18px !important; }
    .co-total-row { align-items: flex-start !important; flex-direction: column !important; gap: 6px !important; }
    .co-success-actions { flex-direction: column !important; }
    .co-success-actions button { min-height: 44px !important; }
  }
`;
 
/* ══════════════════════════════════════════════════════
   CONTADOR  +  —
══════════════════════════════════════════════════════ */
function Counter({ label, sublabel, icon: Icon, iconColor, value, onChange }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* rótulo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: `${iconColor}18`,
            border: `1px solid ${iconColor}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={14} color={iconColor} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#e0e0e0", letterSpacing: 1 }}>{label}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: 2, textTransform: "uppercase" }}>{sublabel}</p>
        </div>
      </div>
 
      {/* controles */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          background: "rgba(0,0,0,.3)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,.08)",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          className="counter-btn"
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{
            width: 44,
            height: 44,
            background: "rgba(255,255,255,.05)",
            border: "none",
            color: value === 0 ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.6)",
            cursor: value === 0 ? "not-allowed" : "pointer",
            fontSize: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Minus size={16} />
        </button>
 
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            textAlign: "center",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 26,
            color: value > 0 ? iconColor : "rgba(255,255,255,.3)",
            padding: "4px 0",
            transition: "color .2s",
          }}
        />
 
        <button
          type="button"
          className="counter-btn"
          onClick={() => onChange(value + 1)}
          style={{
            width: 44,
            height: 44,
            background: "rgba(255,255,255,.05)",
            border: "none",
            color: "rgba(255,255,255,.6)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
 
/* ══════════════════════════════════════════════════════
   UPLOAD DE FOTO
══════════════════════════════════════════════════════ */
function FotoUpload({ foto, preview, onFoto, erro }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
 
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    onFoto(file);
  };
 
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };
 
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: erro ? "#f87171" : "rgba(255,255,255,.4)",
          marginBottom: 10,
        }}
      >
        Foto do encerramento <span style={{ color: "#aa1111" }}>*</span>
      </p>
 
      {preview ? (
        /* preview */
        <div
          className="photo-reveal"
          style={{
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <img
            src={preview}
            alt="preview"
            style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }}
          />
          {/* overlay escuro com botão de trocar */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity .2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: "rgba(0,0,0,.7)",
                border: "1px solid rgba(255,255,255,.2)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 600,
              }}
            >
              <Camera size={15} />
              Trocar foto
            </button>
          </div>
          {/* badge nome */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              right: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                background: "rgba(0,0,0,.7)",
                backdropFilter: "blur(4px)",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 11,
                color: "rgba(255,255,255,.7)",
                maxWidth: "70%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {foto?.name}
            </span>
            <button
              type="button"
              onClick={() => onFoto(null)}
              style={{
                background: "rgba(170,17,17,.7)",
                border: "none",
                borderRadius: 6,
                padding: "4px 8px",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* dropzone */
        <div
          className={`drop-zone co-drop-zone${dragging ? " drag-over" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${erro ? "#ef4444" : dragging ? "#aa1111" : "rgba(255,255,255,.12)"}`,
            borderRadius: 12,
            padding: "36px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            background: erro ? "rgba(239,68,68,.05)" : "rgba(255,255,255,.02)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: erro ? "rgba(239,68,68,.1)" : "rgba(170,17,17,.08)",
              border: `1px solid ${erro ? "rgba(239,68,68,.3)" : "rgba(170,17,17,.2)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImagePlus size={22} color={erro ? "#f87171" : "#aa1111"} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>
              Toque para abrir a câmera
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 4 }}>
              Também aceita galeria/arquivo · máx. {MAX_PHOTO_SIZE_MB} MB
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 16px",
              background: "rgba(170,17,17,.1)",
              border: "1px solid rgba(170,17,17,.2)",
              borderRadius: 20,
              marginTop: 4,
            }}
          >
            <Upload size={12} color="#aa1111" />
            <span style={{ fontSize: 11, color: "#aa1111", fontWeight: 700, letterSpacing: 1 }}>
              Bater foto
            </span>
          </div>
        </div>
      )}
 
      {erro && (
        <p style={{ fontSize: 11, color: "#f87171", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
          <AlertTriangle size={11} /> {erro}
        </p>
      )}
 
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
 
/* ══════════════════════════════════════════════════════
   TELA DE SUCESSO
══════════════════════════════════════════════════════ */
function SuccessScreen({ form, resposta, onVoltar, onLogout }) {
  const prevencoesTotal =
    resposta?.prevencoesTotal ?? form.prevencoesMatutinas + form.prevencoesVespertinas;
  const aguasVivasTotal =
    resposta?.aguasVivasTotal ?? form.aguasVivasMatutinas + form.aguasVivasVespertinas;
  const total =
    prevencoesTotal + aguasVivasTotal;
 
  return (
    <div
      className="co-success"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 32,
        animation: "zoomIn .4s cubic-bezier(.22,1,.36,1) both",
      }}
    >
      {/* anel */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div
          style={{
            position: "absolute",
            inset: -16,
            borderRadius: "50%",
            border: "2px solid rgba(251,191,36,.3)",
            animation: "ring-pulse 1.8s ease-out infinite",
          }}
        />
        <div
          className="success-icon"
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #b45309, #1c1917)",
            border: "2px solid rgba(251,191,36,.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 48px rgba(251,191,36,.2)",
          }}
        >
          <CheckCircle2 size={44} color="#fbbf24" strokeWidth={1.5} />
        </div>
      </div>
 
      <p style={{ fontSize: 11, letterSpacing: 5, color: "rgba(251,191,36,.7)", marginBottom: 10, textTransform: "uppercase" }}>
        Check-out realizado
      </p>
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(30px, 6vw, 52px)",
          color: "#f0f0f0",
          letterSpacing: 3,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        SAÍDA REGISTRADA
      </h2>
 
      {/* resumo */}
      <div
        className="co-success-card"
        style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 16,
          padding: "28px 36px",
          width: "100%",
          maxWidth: 460,
          marginBottom: 36,
        }}
      >
        <div style={{ height: 3, background: "linear-gradient(90deg, #b45309, transparent)", borderRadius: 2, marginBottom: 22 }} />
 
        <div className="co-success-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <StatBox color="#f59e0b" label="Prev. Matutinas"  value={form.prevencoesMatutinas} />
          <StatBox color="#38bdf8" label="Águas Matutinas"  value={form.aguasVivasMatutinas} />
          <StatBox color="#fb923c" label="Prev. Vespertinas" value={form.prevencoesVespertinas} />
          <StatBox color="#34d399" label="Águas Vespertinas" value={form.aguasVivasVespertinas} />
        </div>
 
        <div className="co-total-row" style={{ padding: "12px 16px", background: "rgba(255,255,255,.04)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", letterSpacing: 2, textTransform: "uppercase" }}>Total de ocorrências</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 24, color: "#fbbf24" }}>{total}</span>
        </div>
      </div>
 
      <div className="co-success-actions" style={{ display: "flex", gap: 12, width: "100%", maxWidth: 460 }}>
        <button onClick={onVoltar} style={{ flex: 1, padding: "12px 0", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "rgba(255,255,255,.6)", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Source Sans 3', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <ChevronLeft size={14} /> Voltar
        </button>
        <button onClick={onLogout} style={{ flex: 1, padding: "12px 0", background: "rgba(170,17,17,.15)", border: "1px solid rgba(170,17,17,.35)", borderRadius: 10, color: "#fca5a5", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Source Sans 3', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <LogOut size={14} /> Sair
        </button>
      </div>
    </div>
  );
}
 
function StatBox({ label, value, color }) {
  return (
    <div style={{ background: "rgba(0,0,0,.25)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
      <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 28, color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{label}</p>
    </div>
  );
}
 
/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════ */
export function CheckOut({ posto, onNavegar, onLogout }) {
  const [form, setForm] = useState({
    prevencoesMatutinas: 0,
    aguasVivasMatutinas: 0,
    prevencoesVespertinas: 0,
    aguasVivasVespertinas: 0,
  });
  const [foto, setFoto]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [erro, setErro]         = useState(null);
  const [erros, setErros]       = useState({});
  const [resposta, setResposta] = useState(null);
 
  const postoNome = posto?.nome || localStorage.getItem("postoNome") || "Posto";
  const postoId   = posto?.id   || localStorage.getItem("postoId");
 
  /* ── CSS ────────────────────────────────────────── */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
 
  /* ── preview da foto ────────────────────────────── */
  const handleFoto = (file) => {
    if (file && file.size > MAX_PHOTO_SIZE) {
      setFoto(null);
      setPreview(null);
      setErros((e) => ({ ...e, foto: `A foto deve ter no máximo ${MAX_PHOTO_SIZE_MB} MB.` }));
      return;
    }

    setFoto(file);
    if (!file) { setPreview(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    setErros((e) => ({ ...e, foto: null }));
  };
 
  const setField = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
  };
 
  /* ── validação ──────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!postoId) e.posto = "Selecione um posto antes de registrar o check-out.";
    if (!foto) e.foto = "A foto do encerramento é obrigatória.";
    setErros(e);
    setErro(e.posto || null);
    return Object.keys(e).length === 0;
  };
 
  /* ── submit multipart ───────────────────────────── */
  const handleSubmit = async () => {
    setErro(null);
    if (!validate()) return;
 
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("postoId",               postoId);
      fd.append("foto",                  foto);
      fd.append("prevencoesMatutinas",   form.prevencoesMatutinas);
      fd.append("aguasVivasMatutinas",   form.aguasVivasMatutinas);
      fd.append("prevencoesVespertinas", form.prevencoesVespertinas);
      fd.append("aguasVivasVespertinas", form.aguasVivasVespertinas);
 
      const res = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
 
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || (res.status === 413 ? `A foto deve ter no máximo ${MAX_PHOTO_SIZE_MB} MB.` : `Erro ${res.status}`));
      }
 
      const data = await res.json();
      setResposta(data);
    } catch (e) {
      setErro(e.message || "Não foi possível registrar o check-out.");
    } finally {
      setLoading(false);
    }
  };
 
  /* ════════════════════════════════════════════════════
     SUCESSO
  ════════════════════════════════════════════════════ */
  if (resposta) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Source Sans 3', sans-serif", position: "relative", overflowX: "hidden" }}>
        <BgGrid amber />
        <SuccessScreen form={form} resposta={resposta} onVoltar={() => onNavegar?.("selecionar-posto")} onLogout={onLogout} />
      </div>
    );
  }
 
  /* ════════════════════════════════════════════════════
     FORMULÁRIO
  ════════════════════════════════════════════════════ */
  return (
    <div
      className="co-screen"
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
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(10,10,10,.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(170,17,17,.2)" }}>
        <div className="diagonal-stripes" style={{ height: 3 }} />
        <div className="co-topbar-inner" style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button className="co-topbar-button" onClick={() => onNavegar?.("selecionar-posto")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Source Sans 3', sans-serif", transition: "color .15s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fca5a5"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.4)"}
          >
            <ChevronLeft size={14} /> <span className="co-topbar-label">Postos</span>
          </button>
 
          <div className="co-posto-badge" style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", background: "rgba(170,17,17,.1)", border: "1px solid rgba(170,17,17,.25)", borderRadius: 20 }}>
            <MapPin size={12} color="#aa1111" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>{postoNome}</span>
          </div>
 
          <button className="co-topbar-button" onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(170,17,17,.3)", borderRadius: 6, padding: "5px 12px", color: "rgba(255,255,255,.35)", fontSize: 12, cursor: "pointer", letterSpacing: 1, fontFamily: "'Source Sans 3', sans-serif", transition: "all .15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#aa1111"; e.currentTarget.style.color = "#fca5a5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(170,17,17,.3)"; e.currentTarget.style.color = "rgba(255,255,255,.35)"; }}
          >
            <LogOut size={12} /> <span className="co-topbar-label">SAIR</span>
          </button>
        </div>
      </header>
 
      {/* ── corpo ── */}
      <main className="co-main" style={{ flex: 1, maxWidth: 720, width: "100%", margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>
 
        {/* título */}
        <div className="co-fade-1 co-title-wrap" style={{ marginBottom: 40 }}>
          <div className="co-title-row" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LogOut size={24} color="#fbbf24" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize: 10, color: "rgba(251,191,36,.6)", letterSpacing: 4, textTransform: "uppercase", marginBottom: 3 }}>Encerramento de turno</p>
              <h1 className="co-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: "#f0f0f0", letterSpacing: 3, lineHeight: 1 }}>CHECK-OUT</h1>
            </div>
          </div>
          {/* info usuário + posto */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <Chip icon={<MapPin size={12} />} label={postoNome} />
            <Chip icon={<User size={12} />} label={localStorage.getItem("email") || "—"} />
          </div>
        </div>
 
        {/* erro global */}
        {erro && (
          <div className="co-fade-1" style={{ display: "flex", gap: 10, padding: "12px 16px", background: "rgba(170,17,17,.1)", border: "1px solid rgba(170,17,17,.3)", borderLeft: "3px solid #aa1111", borderRadius: 8, marginBottom: 28 }}>
            <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>{erro}</p>
          </div>
        )}
 
        {/* ─ SEÇÃO: Foto ─ */}
        <Section className="co-fade-2" title="Foto" subtitle="Registre o estado do posto ao encerrar" icon={<Camera size={15} />}>
          <FotoUpload foto={foto} preview={preview} onFoto={handleFoto} erro={erros.foto} />
        </Section>
 
        {/* ─ SEÇÃO: Turno Matutino ─ */}
        <Section className="co-fade-3" title="Turno Matutino" subtitle="Ocorrências do período da manhã" icon={<Sun size={15} />} iconColor="#f59e0b">
          <div className="co-counter-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Counter
              label="Prevenções"
              sublabel="Matutino"
              icon={Shield}
              iconColor="#f59e0b"
              value={form.prevencoesMatutinas}
              onChange={(v) => setField("prevencoesMatutinas", v)}
            />
            <Counter
              label="Águas Vivas"
              sublabel="Matutino"
              icon={Waves}
              iconColor="#38bdf8"
              value={form.aguasVivasMatutinas}
              onChange={(v) => setField("aguasVivasMatutinas", v)}
            />
          </div>
        </Section>
 
        {/* ─ SEÇÃO: Turno Vespertino ─ */}
        <Section className="co-fade-4" title="Turno Vespertino" subtitle="Ocorrências do período da tarde" icon={<Sunset size={15} />} iconColor="#fb923c">
          <div className="co-counter-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Counter
              label="Prevenções"
              sublabel="Vespertino"
              icon={Shield}
              iconColor="#fb923c"
              value={form.prevencoesVespertinas}
              onChange={(v) => setField("prevencoesVespertinas", v)}
            />
            <Counter
              label="Águas Vivas"
              sublabel="Vespertino"
              icon={Waves}
              iconColor="#34d399"
              value={form.aguasVivasVespertinas}
              onChange={(v) => setField("aguasVivasVespertinas", v)}
            />
          </div>
        </Section>
 
        {/* ─ resumo inline ─ */}
        <div className="co-fade-4 co-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 32 }}>
          {[
            { l: "Prev. Mat.", v: form.prevencoesMatutinas,   c: "#f59e0b" },
            { l: "Águas Mat.", v: form.aguasVivasMatutinas,   c: "#38bdf8" },
            { l: "Prev. Ves.", v: form.prevencoesVespertinas, c: "#fb923c" },
            { l: "Águas Ves.", v: form.aguasVivasVespertinas, c: "#34d399" },
          ].map((s) => (
            <div key={s.l} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 22, color: s.c, lineHeight: 1 }}>{s.v}</p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,.3)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{s.l}</p>
            </div>
          ))}
        </div>
 
        {/* ─ botão ─ */}
        <div className="co-fade-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="co-btn"
            style={{
              width: "100%",
              padding: "17px 0",
              background: loading
                ? "rgba(251,191,36,.2)"
                : "linear-gradient(135deg, #92400e 0%, #b45309 40%, #d97706 100%)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 20,
              letterSpacing: 3,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: loading ? "none" : "0 6px 28px rgba(180,83,9,.4)",
            }}
          >
            {loading
              ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> REGISTRANDO...</>
              : <><LogOut size={20} strokeWidth={1.5} /> REGISTRAR CHECK-OUT</>
            }
          </button>
 
          <p style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "rgba(255,255,255,.18)", letterSpacing: 1 }}>
            O horário de saída será registrado automaticamente pelo servidor
          </p>
        </div>
      </main>
    </div>
  );
}
 
/* ── helpers ─────────────────────────────────────────── */
function Section({ children, title, subtitle, icon, iconColor = "#aa1111", className = "" }) {
  return (
    <div
      className={`co-section ${className}`}
      style={{
        marginBottom: 28,
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* cabeçalho da seção */}
      <div className="co-section-header" style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: iconColor }}>{icon}</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", letterSpacing: .5 }}>{title}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.25)", letterSpacing: 1.5, textTransform: "uppercase" }}>{subtitle}</p>
        </div>
      </div>
      <div className="co-section-body" style={{ padding: 20 }}>{children}</div>
    </div>
  );
}
 
function Chip({ icon, label }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20 }}>
      <span style={{ color: "rgba(255,255,255,.3)" }}>{icon}</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{label}</span>
    </div>
  );
}
 
function BgGrid({ amber }) {
  const color = amber ? "251,191,36" : "170,17,17";
  return (
    <>
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(${color},.03) 1px, transparent 1px), linear-gradient(90deg, rgba(${color},.03) 1px, transparent 1px)`, backgroundSize: "48px 48px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "-15%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, rgba(${color},.1) 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
    </>
  );
}
