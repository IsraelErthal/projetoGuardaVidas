export function Menu({ onNavegar, onLogout }) {
  return (
    <nav style={{ display: "flex", gap: 12, padding: 24, background: "#0d0d0d" }}>
      <button type="button" onClick={() => onNavegar?.("dashboard")}>
        Dashboard
      </button>
      <button type="button" onClick={() => onNavegar?.("selecionar-posto")}>
        Postos
      </button>
      <button type="button" onClick={onLogout}>
        Sair
      </button>
    </nav>
  );
}
