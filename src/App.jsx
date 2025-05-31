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

const App = () => {
  const navigate = useNavigate();

  // --- Autenticação ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // --- Leads e usuários ---
  const [leads, setLeads] = useState([]);
  const [leadSelecionado, setLeadSelecionado] = useState(null);
  const [leadsNaoAtribuidos, setLeadsNaoAtribuidos] = useState([]);

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
      usuario: 'maria',
      nome: 'Maria Oliveira',
      email: 'maria@example.com',
      senha: 'senha123',
      status: 'Ativo',
      tipo: 'Usuario',
    },
    {
      id: 3,
      usuario: 'joao',
      nome: 'João Souza',
      email: 'joao@example.com',
      senha: 'joaopass',
      status: 'Ativo',
      tipo: 'Usuario',
    },
    {
      id: 4,
      usuario: 'admin2',
      nome: 'Administrador 2',
      email: 'admin2@example.com',
      senha: 'adminpass',
      status: 'Ativo',
      tipo: 'Admin',
    },
  ]);

  // Para identificar o último lead fechado (para destacar)
  const [ultimoFechadoId, setUltimoFechadoId] = useState(null);

  // --- Efeito para sincronizar leads com Google Sheets ---
  useEffect(() => {
    // Função para buscar todos os leads
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

          // Atualiza leads só se não houver lead selecionado, para não atrapalhar a edição
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

    // Função para buscar leads não atribuídos via Google Apps Script (POST)
    const fetchLeadsNaoAtribuidos = async () => {
      try {
        const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?acao=listarLeadsNaoAtribuidos', {
          method: 'POST',
        });
        const data = await response.json();

        if (data.status === 'ok') {
          setLeadsNaoAtribuidos(data.leads || []);
        } else {
          setLeadsNaoAtribuidos([]);
        }
      } catch (error) {
        console.error('Erro ao buscar leads não atribuídos:', error);
        setLeadsNaoAtribuidos([]);
      }
    };

    fetchLeadsFromSheet();
    fetchLeadsNaoAtribuidos();

    // Atualiza a cada 5 segundos
    const interval = setInterval(() => {
      fetchLeadsFromSheet();
      fetchLeadsNaoAtribuidos();
    }, 5000);

    return () => clearInterval(interval);
  }, [leadSelecionado]);

  // --- Funções para manipular usuários e leads ---

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
      prev.map((lead) => (lead.id === id ? { ...lead, insurer: seguradora } : lead))
    );
  };

  const confirmarSeguradoraLead = (id) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, insurerConfirmed: true } : lead))
    );
  };

  const atualizarDetalhesLeadFechado = (id, campo, valor) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, [campo]: valor } : lead))
    );
  };

  const transferirLead = (leadId, usuarioId) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, usuarioId } : lead))
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

  // --- Login ---
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

  // --- Render login se não autenticado ---
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Entrar no Painel</h2>
          <input
            type="text"
            placeholder="Usuário"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senhaInput}
            onChange={(e) => setSenhaInput(e.target.value)}
            className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = usuarioLogado?.tipo === 'Admin';

  // --- Render principal após login ---
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar isAdmin={isAdmin} nomeUsuario={loginInput} />

      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                leads={isAdmin ? leads : leads.filter((lead) => lead.usuarioId === usuarioLogado.id)}
              />
            }
          />
          <Route
            path="/leads"
            element={
              <Leads
                leads={isAdmin ? leads : leads.filter((lead) => lead.usuarioId === usuarioLogado.id)}
                usuarios={usuarios}
                onUpdateStatus={atualizarStatusLead}
                transferirLead={transferirLead}
                usuarioLogado={usuarioLogado}
                leadsNaoAtribuidos={leadsNaoAtribuidos} // Disponível para uso na aba Leads
                onAbrirLead={onAbrirLead}
              />
            }
          />
          <Route
            path="/leads-fechados"
            element={
              <LeadsFechados
                leads={leads}
                usuarios={usuarios}
                onUpdateInsurer={atualizarSeguradoraLead}
                onConfirmInsurer={confirmarSeguradoraLead}
                onUpdateDetalhes={atualizarDetalhesLeadFechado}
                ultimoFechadoId={ultimoFechadoId}
                onAbrirLead={onAbrirLead}
                leadSelecionado={leadSelecionado}
              />
            }
          />
          <Route
            path="/leads-perdidos"
            element={
              <LeadsPerdidos
                leads={leads}
                usuarios={usuarios}
                onAbrirLead={onAbrirLead}
                leadSelecionado={leadSelecionado}
              />
            }
          />
          <Route path="/buscar-lead" element={<BuscarLead leads={leads} />} />
          {isAdmin && (
            <>
              <Route path="/criar-usuario" element={<CriarUsuario adicionarUsuario={adicionarUsuario} />} />
              <Route
                path="/usuarios"
                element={
                  <Usuarios
                    usuarios={usuarios}
                    atualizarStatusUsuario={atualizarStatusUsuario}
                  />
                }
              />
            </>
          )}
          <Route path="/ranking" element={<Ranking usuarios={usuarios} leads={leads} />} />
          <Route path="*" element={<h1 style={{ padding: 20 }}>Página não encontrada</h1>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
