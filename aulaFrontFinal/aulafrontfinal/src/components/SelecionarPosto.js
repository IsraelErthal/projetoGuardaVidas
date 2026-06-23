import { useState, useEffect } from "react";
import {
  MapPin, ChevronRight, Loader2, AlertTriangle,
  RefreshCw, LogOut, CheckCircle, Search, Shield,
} from "lucide-react";
import { API_URLS, authHeaders } from "../utils/api";

const API_URL = API_URLS.postos;

/* ── CSS global injetado uma vez ─────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,300&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(16px) scale(.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes pulse-dot {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.5); opacity: .6; }
  }
  @keyframes scan-line {
    0%   { top: 0%; opacity: .6; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes stripe-move {
    from { background-position: 0 0; }
    to   { background-position: 40px 0; }
  }

  .sp-card {
    position: relative;
    cursor: pointer;
    transition: transform .22s cubic-bezier(.22,1,.36,1),
                box-shadow .22s ease,
                border-color .22s ease;
    animation: cardIn .45s cubic-bezier(.22,1,.36,1) both;
  }
  .sp-card:hover {
    transform: translateY(-4px) scale(1.015);
    border-color: rgba(170,17,17,.7) !important;
    box-shadow: 0 12px 36px rgba(0,0,0,.5), 0 0 0 1px rgba(170,17,17,.3) !important;
  }
  .sp-card:active { transform: translateY(-1px) scale(1.005); }

  .sp-card .card-arrow {
    transition: transform .2s ease, opacity .2s ease;
    opacity: .3;
  }
  .sp-card:hover .card-arrow {
    transform: translateX(5px);
    opacity: 1;
  }

  .sp-card .card-glow {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(circle at 60% 30%, rgba(170,17,17,.08), transparent 70%);
    opacity: 0;
    transition: opacity .25s ease;
    pointer-events: none;
  }
  .sp-card:hover .card-glow { opacity: 1; }

  .diagonal-stripes {
    background-image: repeating-linear-gradient(
      -45deg, transparent, transparent 8px,
      rgba(170,17,17,.2) 8px, rgba(170,17,17,.2) 10px
    );
    animation: stripe-move 3s linear infinite;
  }

  .fade-hdr { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .05s both; }
  .fade-srch { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .15s both; }
`;

export function SelecionarPosto({ onPostoSelecionado, onLogout }) {
  const [postos, setPostos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState(null);
  const [busca, setBusca]         = useState("");
  const [selecionado, setSelecionado] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const email      = localStorage.getItem("email") || "Guarda vidas";
  const nomeUsuario = email.split("@")[0];

  /* ── injeta CSS ──────────────────────────────────── */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  /* ── busca postos ────────────────────────────────── */
  const fetchPostos = async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(API_URL, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPostos(data);
    } catch {
      setErro("Não foi possível carregar os postos. Verifique o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPostos(); }, []);

  /* ── confirmar seleção ───────────────────────────── */
  const handleSelecionar = async (posto) => {
    setSelecionado(posto);
    setConfirmando(true);
    await new Promise((r) => setTimeout(r, 900)); // feedback visual
    onPostoSelecionado?.(posto);
  };

  const filtrados = postos.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.descricao || "").toLowerCase().includes(busca.toLowerCase())
  );

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        fontFamily: "'Source Sans 3', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── grade de fundo ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(170,17,17,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(170,17,17,.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />
      {/* glow central */}
      <div
        style={{
          position: "fixed",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(120,0,0,.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── topo institucional ── */}
      <div
        style={{
          background: "rgba(0,0,0,.6)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(170,17,17,.25)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        {/* faixa listras */}
        <div className="diagonal-stripes" style={{ height: 3 }} />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #cc2222, #5c0000)",
                border: "1.5px solid rgba(170,17,17,.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 12,
                  letterSpacing: 1,
                }}
              >
                CBM
              </span>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 16,
                  letterSpacing: 3,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                CBMSC
              </p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: 2 }}>
                SISTEMA OPERACIONAL
              </p>
            </div>
          </div>

          {/* usuário + sair */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "rgba(255,255,255,.7)", fontSize: 12, fontWeight: 600 }}>
                {nomeUsuario}
              </p>
              <p style={{ fontSize: 10, color: "rgba(170,17,17,.8)", letterSpacing: 2, textTransform: "uppercase" }}>
                Padrão
              </p>
            </div>
            <button
              onClick={onLogout}
              title="Sair"
              style={{
                background: "none",
                border: "1px solid rgba(170,17,17,.3)",
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
                color: "rgba(255,255,255,.4)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                letterSpacing: 1,
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#aa1111";
                e.currentTarget.style.color = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(170,17,17,.3)";
                e.currentTarget.style.color = "rgba(255,255,255,.4)";
              }}
            >
              <LogOut size={13} />
              SAIR
            </button>
          </div>
        </div>
      </div>

      {/* ── corpo ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "56px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── cabeçalho ── */}
        <div className="fade-hdr" style={{ marginBottom: 48 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
              padding: "5px 14px",
              borderRadius: 20,
              background: "rgba(170,17,17,.12)",
              border: "1px solid rgba(170,17,17,.25)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#aa1111",
                display: "inline-block",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,100,100,.8)",
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Seleção de posto
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(36px, 6vw, 64px)",
              color: "#f0f0f0",
              letterSpacing: 3,
              lineHeight: 1,
              marginBottom: 12,
            }}
          >
            ESCOLHA SEU{" "}
            <span
              style={{
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(170,17,17,.7)",
              }}
            >
              POSTO
            </span>
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,.35)",
              maxWidth: 480,
              lineHeight: 1.7,
              fontStyle: "italic",
            }}
          >
            Selecione o posto operacional ao qual deseja se vincular nesta sessão.
          </p>
        </div>

        {/* ── barra de busca ── */}
        {!loading && !erro && postos.length > 0 && (
          <div className="fade-srch" style={{ marginBottom: 40, maxWidth: 400 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,.25)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Buscar posto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 40px 11px 40px",
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 8,
                  color: "#e5e5e5",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "'Source Sans 3', sans-serif",
                  transition: "border-color .2s, box-shadow .2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(170,17,17,.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(170,17,17,.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
              {busca && (
                <button
                  onClick={() => setBusca("")}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,.3)",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <Shield size={13} />
                </button>
              )}
            </div>
            {busca && (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 8, marginLeft: 4 }}>
                {filtrados.length} posto{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* ── loading ── */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: 16,
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: "2px solid rgba(170,17,17,.15)",
                  borderTop: "2px solid #aa1111",
                  animation: "spin 1s linear infinite",
                }}
              />
              <MapPin
                size={20}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#aa1111",
                }}
              />
            </div>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: 13, letterSpacing: 2 }}>
              CARREGANDO POSTOS...
            </p>
          </div>
        )}

        {/* ── erro ── */}
        {!loading && erro && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: "60px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(170,17,17,.1)",
                border: "1px solid rgba(170,17,17,.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={24} color="#aa1111" />
            </div>
            <div>
              <p style={{ color: "#f0f0f0", fontWeight: 700, marginBottom: 6 }}>Erro ao carregar</p>
              <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13, marginBottom: 20 }}>{erro}</p>
              <button
                onClick={fetchPostos}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
                  background: "rgba(170,17,17,.15)",
                  border: "1px solid rgba(170,17,17,.4)",
                  borderRadius: 8,
                  color: "#fca5a5",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: 1,
                  fontFamily: "inherit",
                }}
              >
                <RefreshCw size={14} />
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* ── lista vazia ── */}
        {!loading && !erro && filtrados.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              padding: "60px 0",
              textAlign: "center",
            }}
          >
            <MapPin size={36} style={{ color: "rgba(255,255,255,.1)" }} />
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>
              {busca ? "Nenhum posto encontrado para essa busca." : "Nenhum posto disponível no momento."}
            </p>
          </div>
        )}

        {/* ── grade de cards ── */}
        {!loading && !erro && filtrados.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {filtrados.map((posto, idx) => (
              <PostoCard
                key={posto.id}
                posto={posto}
                idx={idx}
                selecionado={selecionado?.id === posto.id}
                confirmando={confirmando && selecionado?.id === posto.id}
                onSelecionar={handleSelecionar}
              />
            ))}
          </div>
        )}

        {/* contador rodapé */}
        {!loading && !erro && postos.length > 0 && (
          <div
            style={{
              marginTop: 48,
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,.06)",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,.15)",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {postos.length} posto{postos.length !== 1 ? "s" : ""} disponíve{postos.length !== 1 ? "is" : "l"} · CBMSC
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CARD DE POSTO
══════════════════════════════════════════════════════ */
export function PostoCard({ posto, idx, selecionado, confirmando, onSelecionar }) {
  /* cor de acento única por índice */
  const accents = ["#aa1111", "#8b1a1a", "#c0392b", "#922b21", "#a93226"];
  const accent  = accents[idx % accents.length];

  return (
    <div
      className="sp-card"
      onClick={() => !confirmando && onSelecionar(posto)}
      style={{
        background: selecionado
          ? "rgba(170,17,17,.18)"
          : "rgba(255,255,255,.04)",
        border: `1px solid ${selecionado ? "rgba(170,17,17,.6)" : "rgba(255,255,255,.08)"}`,
        borderRadius: 12,
        padding: 0,
        overflow: "hidden",
        animationDelay: `${idx * 0.06}s`,
        boxShadow: selecionado
          ? "0 8px 32px rgba(170,17,17,.25), 0 0 0 1px rgba(170,17,17,.3)"
          : "0 2px 12px rgba(0,0,0,.3)",
      }}
    >
      <div className="card-glow" />

      {/* faixa superior colorida */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />

      <div style={{ padding: "22px 24px 24px" }}>
        {/* ícone + id */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: `rgba(170,17,17,.12)`,
              border: `1px solid rgba(170,17,17,.2)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {confirmando && selecionado ? (
              <CheckCircle size={20} color="#4ade80" />
            ) : (
              <MapPin size={20} color={accent} />
            )}
          </div>

          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,.2)",
              letterSpacing: 2,
            }}
          >
            #{String(posto.id).padStart(3, "0")}
          </span>
        </div>

        {/* nome */}
        <h3
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22,
            color: selecionado ? "#fca5a5" : "#f0f0f0",
            letterSpacing: 1.5,
            lineHeight: 1.1,
            marginBottom: 8,
            transition: "color .2s",
          }}
        >
          {posto.nome}
        </h3>

        {/* descrição */}
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,.35)",
            lineHeight: 1.6,
            minHeight: 40,
            fontStyle: posto.descricao ? "normal" : "italic",
            marginBottom: 20,
          }}
        >
          {posto.descricao || "Sem descrição disponível."}
        </p>

        {/* botão */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: selecionado ? "#fca5a5" : "rgba(255,255,255,.2)",
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 700,
              transition: "color .2s",
            }}
          >
            {confirmando && selecionado ? "Confirmado!" : "Selecionar"}
          </span>
          <div
            className="card-arrow"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: selecionado ? "rgba(170,17,17,.3)" : "rgba(255,255,255,.05)",
              border: `1px solid ${selecionado ? "rgba(170,17,17,.5)" : "rgba(255,255,255,.08)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .2s, border-color .2s",
            }}
          >
            {confirmando && selecionado ? (
              <Loader2 size={14} color="#fca5a5" style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <ChevronRight size={14} color={selecionado ? "#fca5a5" : "rgba(255,255,255,.4)"} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
