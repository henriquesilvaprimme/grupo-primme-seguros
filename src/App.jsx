import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Leads from './Leads';
import LeadsFechados from './LeadsFechados';
import LeadsPerdidos from './LeadsPerdidos';
import BuscarLead from './BuscarLead';
import CriarUsuario from './pages/CriarUsuario';
import Usuarios from './pages/Usuarios';
import Ranking from './pages/Ranking';

const GOOGLE_SHEETS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgeZteouyVWzrCvgHHQttx-5Bekgs_k-5EguO9Sn2p-XFrivFg9S7_gGKLdoDfCa08/exec';

// INÍCIO - funções para comunicação com Google Sheets
async function criarUsuario(dados) {
  const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'criarUsuario',
      payload: dados
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

async function criarLead(dados) {
  const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'criarLead',
      payload: dados
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

async function fecharLead(leadId) {
  const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'fecharLead',
      payload: { leadId }
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

async function perderLead(leadId) {
  const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'perderLead',
      payload: { leadId }
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

async function editarUsuario(dados) {
  const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'editarUsuario',
      payload: dados
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}
// FIM - funções para comunicação com Google Sheets

const App = () => {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // INÍCIO - sincronização leads via Google Sheets
  const [leads, setLeads] = useState([]);
  const [leadSelecionado, setLeadSelecionado] = useState(null); // movido para cá para usar no useEffect

  useEffect(() => {
    const fetchLeadsFromSheet = async () => {
      try {
        const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?action=getLeads');
        const data = await response.json();

        if (Array.isArray(data)) {
          const formattedLeads = data.map((item, index) => ({
            id: item.id ? Number(item.id) : index + 1,
            name: item.name || item.Name || '',
            vehicleModel: item.vehiclemodel || item.vehicleModel || '',
            vehicleYearModel: item.vehicleYearModel || item.vehicleYearModel || '',
            city: item.city || '',
            phone: item.phone || item.Telefone || '',
            insuranceType: item.insuranceType || '',
            status: item.status || 'Selecione o status',
            confirmado: item.confirmado === 'true' || item.confirmado === true,
            insurer: item.insurer || '',
            insurerConfirmed: item.insurerConfirmed === 'true' || item.insurerConfirmed === true,
            usuarioId: item.usuarioId ? Number(item.usuarioId) : null,
            premioLiquido: item.premioLiquido || '',
            comissao: item.comissao || '',
            parcelamento: item.parcelamento || '',
            createdAt: item.createdAt || new Date().toISOString(),
          }));

          // Só atualiza leads se não houver lead selecionado para não atrapalhar o usuário
          if (!leadSelecionado) {
            setLeads(formattedLeads);
          }
        } else {
          if (!leadSelecionado) {
            setLeads([]);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar leads do Google Sheets:', error);
        if (!leadSelecionado) {
          setLeads([]);
        }
      }
    };

    fetchLeadsFromSheet();

    const interval = setInterval(() => {
      fetchLeadsFromSheet();
    }, 30000);

    return () => clearInterval(interval);
  }, [leadSelecionado]);
  // FIM - sincronização leads

  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      usuario: '1', // login
      nome: 'Administrador 1',
      email: 'admin1@example.com',
      senha: '1',
      status: 'Ativo',
      tipo: 'Admin',
    },
    {
      id: 2,
      usuario: 'maria', // login
      nome: 'Maria Oliveira',
      email: 'maria@example.com',
      senha: 'senha123',
      status: 'Ativo',
      tipo: 'Usuario',
    },
    {
      id: 3,
      usuario: 'joao', // login
      nome: 'João Souza',
      email: 'joao@example.com',
      senha: 'joaopass',
      status: 'Ativo',
      tipo: 'Usuario',
    },
    {
      id: 4,
      usuario: 'admin2', // login
      nome: 'Administrador 2',
      email: 'admin2@example.com',
      senha: 'adminpass',
      status: 'Ativo',
      tipo: 'Admin',
    },
  ]);

  const [ultimoFechadoId, setUltimoFechadoId] = useState(null);

  const adicionarUsuario = (usuario) => {
    setUsuarios((prev) => [...prev, { ...usuario, id: prev.length + 1 }]);
  };

  const atualizarStatusLead = (id, novoStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, status: novoStatus, confirmado: true } : lead
      )
    );

    if (novoStatus === 'Fechado') {
      setUltimoFechadoId(id);
    }
  };

  const atualizarSeguradoraLead = (id, seguradora) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, insurer: seguradora } : lead
      )
    );
  };

  const confirmarSeguradoraLead = (id) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, insurerConfirmed: true } : lead
      )
    );
  };

  const atualizarDetalhesLeadFechado = (id, campo, valor) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, [campo]: valor } : lead
      )
    );
  };

  const transferirLead = (leadId, usuarioId) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, usuarioId } : lead
      )
    );
  };

  const atualizarStatusUsuario = (id, novoStatus = null, novoTipo = null) => {
    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === id
          ? {
              ...usuario,
              ...(novoStatus !== null ? { status: novoStatus } : {}),
              ...(novoTipo !== null ? { tipo: novoTipo } : {}),
            }
          : usuario
      )
    );
  };

  const onAbrirLead = (lead) => {
    setLeadSelecionado(lead);

    let path = '/leads';
    if (lead.status === 'Fechado') path = '/leads-fechados';
    else if (lead.status === 'Perdido') path = '/leads-perdidos';

    navigate(path);
  };

  const handleLogin = () => {
    const usuarioEncontrado = usuarios.find(
      (u) => u.usuario === loginInput && u.senha === senhaInput && u.status === 'Ativo'
    );

    if (usuarioEncontrado) {
      setIsAuthenticated(true);
      setUsuarioLogado(usuarioEncontrado);
    } else {
      alert('Login ou senha inválidos ou usuário inativo.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-8 text-center">Login</h2>
          <input
            type="text"
            placeholder="Usuário"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-4"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senhaInput}
            onChange={(e) => setSenhaInput(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-6"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white p-3 rounded font-semibold hover:bg-indigo-700 transition"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar usuario={usuarioLogado} />
      <main className="flex-1 p-6 bg-gray-100 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={<Dashboard usuario={usuarioLogado} />}
          />
          <Route
            path="/leads"
            element={
              <Leads
                leads={leads}
                onAbrirLead={onAbrirLead}
                atualizarStatusLead={atualizarStatusLead}
                atualizarSeguradoraLead={atualizarSeguradoraLead}
                confirmarSeguradoraLead={confirmarSeguradoraLead}
                atualizarDetalhesLeadFechado={atualizarDetalhesLeadFechado}
                transferirLead={transferirLead}
                usuarioLogado={usuarioLogado}
                criarLead={criarLead}
                fecharLead={fecharLead}
                perderLead={perderLead}
              />
            }
          />
          <Route
            path="/leads-fechados"
            element={
              <LeadsFechados leads={leads.filter(lead => lead.status === 'Fechado')} />
            }
          />
          <Route
            path="/leads-perdidos"
            element={
              <LeadsPerdidos leads={leads.filter(lead => lead.status === 'Perdido')} />
            }
          />
          <Route
            path="/buscar-lead"
            element={<BuscarLead leads={leads} />}
          />
          <Route
            path="/usuarios"
            element={
              <Usuarios
                usuarios={usuarios}
                atualizarStatusUsuario={atualizarStatusUsuario}
                editarUsuario={editarUsuario}
              />
            }
          />
          <Route
            path="/criar-usuario"
            element={
              <CriarUsuario
                adicionarUsuario={adicionarUsuario}
                criarUsuario={criarUsuario}
              />
            }
          />
          <Route
            path="/ranking"
            element={<Ranking usuarios={usuarios} />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
