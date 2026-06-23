import { useEffect, useState } from "react";
import { Login } from "./components/Login";
import { SelecionarPosto } from "./components/SelecionarPosto";
import { Checkin } from "./components/Checkin";
import { CheckOut } from "./components/CheckOut";
import { Menu } from "./components/Menu";
import { Posto } from "./components/Posto";
import { Dashboard } from "./components/Dashboard";
import { API_URLS, authHeaders } from "./utils/api";

function paginaInicial() {
  const token = localStorage.getItem("token");
  if (!token) return "login";

  const nivel = localStorage.getItem("nivelAcesso");
  if (nivel === "ADMIN") return "dashboard";

  const paginaSalva = localStorage.getItem("paginaAtual");
  const postoId = localStorage.getItem("postoId");
  const paginasValidas = ["selecionar-posto", "dashboard", "checkin", "checkout", "menu", "posto"];

  if (paginaSalva && paginasValidas.includes(paginaSalva)) {
    return postoId || paginaSalva === "selecionar-posto" ? paginaSalva : "selecionar-posto";
  }

  return postoId ? "dashboard" : "selecionar-posto";
}

export default function App() {
  const [pagina, setPagina] = useState(paginaInicial);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [postoAtivo, setPostoAtivo] = useState(
    localStorage.getItem("postoId")
      ? {
        id: localStorage.getItem("postoId"),
        nome: localStorage.getItem("postoNome"),
      }
      : null
  );

  const navegar = (proximaPagina) => {
    setPagina(proximaPagina);
    if (proximaPagina === "login") {
      localStorage.removeItem("paginaAtual");
    } else {
      localStorage.setItem("paginaAtual", proximaPagina);
    }
  };

  useEffect(() => {
    if (!token) return;

    let ativo = true;
    fetch(API_URLS.me, { headers: authHeaders() })
      .then((res) => {
        if (!ativo) return;
        if (!res.ok) {
          setToken(null);
          setPostoAtivo(null);
          localStorage.clear();
          setPagina("login");
        }
      })
      .catch(() => {
        if (!ativo) return;
      });

    return () => {
      ativo = false;
    };
  }, [token]);

  const handleLoginSuccess = (data) => {
    const nivel = data?.tipo || "";
    setToken(data?.token);
    localStorage.setItem("token", data?.token);
    localStorage.setItem("nivelAcesso", nivel);
    localStorage.setItem("email", data?.email || "");
    navegar(nivel === "PADRAO" ? "selecionar-posto" : "dashboard");
  };

  const handlePostoSelecionado = (posto) => {
    setPostoAtivo(posto);
    localStorage.setItem("postoId", posto.id);
    localStorage.setItem("postoNome", posto.nome);
    navegar("dashboard");
  };

  const handleLogout = () => {
    setToken(null);
    setPostoAtivo(null);
    localStorage.clear();
    setPagina("login");
  };

  if (pagina === "login" || !token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (pagina === "selecionar-posto") {
    return <SelecionarPosto onPostoSelecionado={handlePostoSelecionado} onLogout={handleLogout} />;
  }

  if (pagina === "checkin") {
    return <Checkin posto={postoAtivo} onNavegar={navegar} onLogout={handleLogout} />;
  }

  if (pagina === "checkout") {
    return <CheckOut posto={postoAtivo} onNavegar={navegar} onLogout={handleLogout} />;
  }

  if (pagina === "menu") {
    return <Menu posto={postoAtivo} onNavegar={navegar} onLogout={handleLogout} />;
  }

  if (pagina === "posto") {
    return <Posto onNavegar={navegar} onLogout={handleLogout} />;
  }

  if (pagina === "dashboard") {
    return (
      <Dashboard
        posto={postoAtivo}
        onNavegar={navegar}
        onLogout={handleLogout}
      />
    );
  }



  return <Login onLoginSuccess={handleLoginSuccess} />;
}
