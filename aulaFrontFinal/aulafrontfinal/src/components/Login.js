import { useState, useEffect } from "react";
import { Hash, Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import { API_URLS } from "../utils/api";

const API_URL = API_URLS.login;

/* ── paleta ─────────────────────────────────────────── */
const C = {
  red:    "#aa1111",
  dark:   "#8b0000",
  deeper: "#5c0000",
  black:  "#0e0e0e",
  panel:  "#141414",
};

/* ── keyframes injetados uma vez ──────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:wght@300;400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(.9); opacity: .6; }
    50%  { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(.9); opacity: .6; }
  }
  @keyframes stripe-move {
    from { background-position: 0 0; }
    to   { background-position: 40px 0; }
  }
  @keyframes shimmer {
    0%   { left: -60%; }
    100% { left: 130%; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .fade-up-1 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .1s both; }
  .fade-up-2 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .22s both; }
  .fade-up-3 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .34s both; }
  .fade-up-4 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .46s both; }
  .slide-in  { animation: slideIn .6s cubic-bezier(.22,1,.36,1) .05s both; }

  input:-webkit-autofill,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #1c1c1c inset !important;
    -webkit-text-fill-color: #e5e5e5 !important;
    caret-color: #e5e5e5;
  }

  .cbm-input:focus { outline: none; }
  .cbm-btn { position: relative; overflow: hidden; }
  .cbm-btn::after {
    content: '';
    position: absolute;
    top: 0; left: -60%;
    width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent);
    transform: skewX(-20deg);
  }
  .cbm-btn:not(:disabled):hover::after {
    animation: shimmer .55s ease forwards;
  }

  .diagonal-stripes {
    background-image: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 8px,
      rgba(170,17,17,.18) 8px,
      rgba(170,17,17,.18) 10px
    );
    animation: stripe-move 3s linear infinite;
  }

  ::-webkit-scrollbar { display: none; }

  /* ── RESPONSIVIDADE MOBILE ─────────────────────────── */

  /* Painel esquerdo: visível por padrão (desktop) */
  .cbm-left-panel {
    display: flex;
  }

  /* Painel direito: largura flex por padrão */
  .cbm-right-panel {
    flex: 1;
    padding: 48px 32px;
  }

  /* Faixa de topo mobile (substitui painel esquerdo) */
  .cbm-mobile-header {
    display: none;
  }

  @media (max-width: 768px) {
    /* Esconde o painel decorativo esquerdo */
    .cbm-left-panel {
      display: none !important;
    }

    /* Painel do form ocupa tela toda */
    .cbm-right-panel {
      padding: 0 !important;
      align-items: stretch !important;
    }

    /* Mostra cabeçalho mobile com identidade da marca */
    .cbm-mobile-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #5c0000 0%, #141414 100%);
      border-bottom: 3px solid #aa1111;
      position: relative;
      overflow: hidden;
    }

    .cbm-mobile-header::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(170,17,17,.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(170,17,17,.07) 1px, transparent 1px);
      background-size: 28px 28px;
    }

    /* Form container com padding adequado para mobile */
    .cbm-form-container {
      padding: 32px 24px 40px !important;
    }

    /* Título do form menor em mobile */
    .cbm-form-title {
      font-size: 30px !important;
    }

    /* Margem do cabeçalho do form menor em mobile */
    .cbm-form-header {
      margin-bottom: 28px !important;
    }
  }
`;

/* ══════════════════════════════════════════════════════
   FIELD
══════════════════════════════════════════════════════ */
function Field({ id, label, type, icon: Icon, value, placeholder, onChange, error, onKeyDown, right, showPass }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          position: "relative",
          borderRadius: 8,
          border: `1.5px solid ${error ? C.red : focused ? "rgba(170,17,17,.7)" : "rgba(255,255,255,.1)"}`,
          background: "#1c1c1c",
          transition: "border-color .2s, box-shadow .2s",
          boxShadow: focused
            ? `0 0 0 3px rgba(170,17,17,.18)`
            : error
            ? `0 0 0 3px rgba(170,17,17,.15)`
            : "none",
        }}
      >
        <label
          htmlFor={id}
          style={{
            position: "absolute",
            left: 44,
            top: active ? 8 : "50%",
            transform: active ? "none" : "translateY(-50%)",
            fontSize: active ? 10 : 14,
            color: error ? C.red : focused ? "#e07070" : "rgba(255,255,255,.4)",
            fontWeight: 600,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            transition: "all .18s ease",
            pointerEvents: "none",
            fontFamily: "'Source Sans 3', sans-serif",
          }}
        >
          {label}
        </label>

        <span
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: error ? C.red : focused ? "#e07070" : "rgba(255,255,255,.3)",
            transition: "color .2s",
            display: "flex",
          }}
        >
          <Icon size={16} />
        </span>

        <input
          id={id}
          className="cbm-input"
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          placeholder={active ? placeholder : ""}
          style={{
            width: "100%",
            paddingTop: active ? 22 : 14,
            paddingBottom: active ? 8 : 14,
            paddingLeft: 44,
            paddingRight: right ? 44 : 16,
            background: "transparent",
            border: "none",
            color: "#e8e8e8",
            fontSize: 16, /* 16px evita zoom automático no iOS */
            fontFamily: "'Source Sans 3', sans-serif",
            letterSpacing: ".01em",
          }}
        />

        {right && (
          <button
            type="button"
            onClick={right}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,.35)",
              display: "flex",
              padding: 8, /* área de toque maior */
            }}
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

      {error && (
        <p
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            color: "#f87171",
            fontSize: 11,
            marginTop: 5,
            marginLeft: 4,
            fontFamily: "'Source Sans 3', sans-serif",
          }}
        >
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════ */
export function Login({ onLoginSuccess }) {
  const [form, setForm]         = useState({ cpf: "", senha: "" });
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.cpf.trim()) {
      e.cpf = "O CPF deve ser preenchido.";
    } else if (!/^\d{11}$/.test(form.cpf)) {
      e.cpf = "O CPF deve conter exatamente 11 dígitos numéricos.";
    }
    if (!form.senha.trim()) {
      e.senha = "A senha deve ser preenchida.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev?.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ cpf: form.cpf, senha: form.senha }),
      });
      if (res.status === 401 || res.status === 403) {
        setApiError("CPF ou senha incorretos. Verifique suas credenciais.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setApiError(body?.message || `Erro ${res.status}. Tente novamente.`);
        return;
      }
      const data = await res.json().catch(() => ({}));
      localStorage.setItem("nome", data?.nome || "");
      setSuccess(true);
      setTimeout(() => onLoginSuccess?.(data), 1200);
    } catch {
      setApiError("Não foi possível conectar ao servidor. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  /* ── RENDER ────────────────────────────────────────── */
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Source Sans 3', sans-serif",
        background: C.black,
      }}
    >
      {/* ════ PAINEL ESQUERDO (desktop only) ════════════ */}
      <div
        className="slide-in cbm-left-panel"
        style={{
          flex: "0 0 48%",
          background: `linear-gradient(160deg, ${C.deeper} 0%, ${C.panel} 55%, #0a0a0a 100%)`,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* grade decorativa de fundo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(170,17,17,.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(170,17,17,.06) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* losango decorativo central */}
        <div
          style={{
            position: "absolute",
            top: "38%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(45deg)",
            width: 340,
            height: 340,
            border: `1px solid rgba(170,17,17,.15)`,
            borderRadius: 12,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "38%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(45deg)",
            width: 220,
            height: 220,
            border: `1px solid rgba(170,17,17,.12)`,
            borderRadius: 8,
          }}
        />

        {/* faixa diagonal de listras no topo */}
        <div
          className="diagonal-stripes"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
          }}
        />

        {/* logo / identidade */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, #cc2222, ${C.deeper})`,
                border: `2px solid rgba(170,17,17,.6)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 0 6px rgba(170,17,17,.08), 0 4px 20px rgba(0,0,0,.5)`,
                animation: "pulse-ring 3s ease-in-out infinite",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 1 }}>
                CBM
              </span>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 20,
                  letterSpacing: 3,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                CBMSC
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,.4)", letterSpacing: 2, textTransform: "uppercase" }}>
                Guarda Vidas
              </p>
            </div>
          </div>
        </div>

        {/* texto central */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: 48,
              height: 3,
              background: C.red,
              borderRadius: 2,
              marginBottom: 20,
            }}
          />
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 52,
              lineHeight: 1.0,
              color: "#fff",
              letterSpacing: 3,
              marginBottom: 16,
            }}
          >
            SISTEMA DE<br />
            <span style={{ color: C.red }}>GESTÃO</span><br />
            OPERACIONAL
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.45)",
              lineHeight: 1.7,
              maxWidth: 280,
            }}
          >
            Acesso restrito a militares credenciados.
            Utilize suas credenciais institucionais para entrar.
          </p>
        </div>

        {/* rodapé painel esquerdo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: "100%",
              height: 1,
              background: "linear-gradient(90deg, rgba(170,17,17,.4), transparent)",
              marginBottom: 16,
            }}
          />
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.25)", letterSpacing: 1, textTransform: "uppercase" }}>
            Estado de Santa Catarina · Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* ════ PAINEL DIREITO — FORMULÁRIO ════════════════ */}
      <div
        className="cbm-right-panel"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Cabeçalho de identidade (apenas mobile) ── */}
        <div className="cbm-mobile-header" style={{ width: "100%" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, #cc2222, ${C.deeper})`,
              border: `2px solid rgba(170,17,17,.6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
              zIndex: 1,
              animation: "pulse-ring 3s ease-in-out infinite",
            }}
          >
            <span style={{ color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: 1 }}>
              CBM
            </span>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: "#fff", lineHeight: 1 }}>
              CBMSC
            </p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,.4)", letterSpacing: 2, textTransform: "uppercase" }}>
              Sistema de Gestão Operacional
            </p>
          </div>
        </div>

        {/* Ruído sutil no fundo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 70% 30%, rgba(100,0,0,.12) 0%, transparent 60%)`,
          }}
        />

        {/* Container do formulário */}
        <div
          className="cbm-form-container"
          style={{
            width: "100%",
            maxWidth: 400,
            position: "relative",
            zIndex: 1,
            padding: "0 32px",
          }}
        >
          {/* Cabeçalho do form */}
          <div className="fade-up-1 cbm-form-header" style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 3,
                  background: C.red,
                  borderRadius: 2,
                }}
              />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", letterSpacing: 3, textTransform: "uppercase" }}>
                Autenticação
              </span>
            </div>
            <h2
              className="cbm-form-title"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 38,
                color: "#f0f0f0",
                letterSpacing: 2,
                lineHeight: 1.05,
              }}
            >
              ACESSO AO SISTEMA
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", marginTop: 6 }}>
              Informe suas credenciais institucionais
            </p>
          </div>

          {/* Sucesso */}
          {success ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                padding: "40px 24px",
                animation: "fadeUp .4s ease both",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(21,128,61,.2)",
                  border: "2px solid #16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={28} color="#22c55e" />
              </div>
              <p style={{ color: "#4ade80", fontWeight: 700, fontSize: 15, textAlign: "center" }}>
                Autenticação realizada com sucesso!
              </p>
              <p style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>
                Redirecionando...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              {/* Erro global da API */}
              {apiError && (
                <div
                  className="fade-up-1"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 14px",
                    background: "rgba(170,17,17,.12)",
                    border: `1px solid rgba(170,17,17,.35)`,
                    borderRadius: 8,
                    marginBottom: 24,
                    borderLeft: `3px solid ${C.red}`,
                  }}
                >
                  <AlertCircle size={15} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ color: "#fca5a5", fontSize: 13, lineHeight: 1.5 }}>{apiError}</p>
                </div>
              )}

              {/* Campos */}
              <div className="fade-up-2" style={{ marginBottom: 14 }}>
                <Field
                  id="cpf"
                  label="CPF"
                  type="text"
                  icon={Hash}
                  value={form.cpf}
                  placeholder="00000000000"
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setForm((f) => ({ ...f, cpf: valor }));
                    if (errors.cpf) setErrors((er) => ({ ...er, cpf: "" }));
                    setApiError("");
                  }}
                  error={errors.cpf}
                  onKeyDown={handleKey}
                />
              </div>

              <div className="fade-up-3" style={{ marginBottom: 8 }}>
                <Field
                  id="senha"
                  label="Senha"
                  type={showPass ? "text" : "password"}
                  icon={Lock}
                  value={form.senha}
                  placeholder="••••••••"
                  onChange={(e) => {
                    setForm((f) => ({ ...f, senha: e.target.value }));
                    if (errors.senha) setErrors((er) => ({ ...er, senha: "" }));
                    setApiError("");
                  }}
                  error={errors.senha}
                  onKeyDown={handleKey}
                  showPass={showPass}
                  right={() => setShowPass((v) => !v)}
                />
              </div>

              {/* Esqueci senha */}
              <div className="fade-up-3" style={{ textAlign: "right", marginBottom: 28 }}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,.3)",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Source Sans 3', sans-serif",
                    padding: "8px 0", /* área de toque maior */
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#e07070"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,.3)"}
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão entrar */}
              <div className="fade-up-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="cbm-btn"
                  style={{
                    width: "100%",
                    padding: "16px 24px", /* um pouco maior para toque */
                    background: loading
                      ? "rgba(170,17,17,.5)"
                      : `linear-gradient(135deg, ${C.dark} 0%, ${C.red} 50%, #c0392b 100%)`,
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 18,
                    letterSpacing: 3,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: loading ? "none" : `0 4px 20px rgba(170,17,17,.4)`,
                    transition: "all .2s",
                    touchAction: "manipulation", /* remove delay de 300ms no iOS */
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.boxShadow = `0 6px 28px rgba(170,17,17,.6)`;
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.boxShadow = `0 4px 20px rgba(170,17,17,.4)`;
                  }}
                >
                  {loading
                    ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                    : <ChevronRight size={18} />}
                  {loading ? "AUTENTICANDO..." : "ENTRAR NO SISTEMA"}
                </button>
              </div>

              {/* divisor */}
              <div
                className="fade-up-4"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  margin: "28px 0 0",
                }}
              >
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.2)", letterSpacing: 2, textTransform: "uppercase" }}>
                  Acesso Seguro
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
              </div>

              {/* badge segurança */}
              <div
                className="fade-up-4"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 14,
                }}
              >
                <ShieldCheck size={13} color="rgba(255,255,255,.2)" />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)", letterSpacing: 1 }}>
                  Comunicação criptografada · CBMSC © {new Date().getFullYear()}
                </span>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ─ faixa lateral fina no extremo direito ─ */}
      <div
        className="diagonal-stripes"
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: 4,
        }}
      />
    </div>
  );
}
