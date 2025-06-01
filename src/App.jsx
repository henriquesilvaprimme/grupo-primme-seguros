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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // --- INÍCIO - sincronização leads via Google Sheets ---
  const [leads, setLeads] = useState([]);
  const [leadSelecionado, setLeadSelecionado] = useState(null);

  const [leadsFechados, setLeadsFechados] = useState([]);
  const [leadsPerdidos, setLeadsPerdidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Sincronização de usuários atualizada (antes estava com dados fixos)
  // Vamos carregar do Sheets ao iniciar:
  useEffect(() => {
    const fetchUsuariosFromSheet = async () => {
      try {
        const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?action=getUsuarios');
        const data = await response.json();
        if (Array.isArray(data)) {
          const formattedUsuarios = data.map((item, index) => ({
            id: item.id ? Number(item.id) : index + 1,
            usuario: item.usuario || '',
            nome: item.nome || '',
            email: item.email || '',
            senha: item.senha || '',
            status: item.status || 'Ativo',
            tipo: item.tipo || 'Usuario',
            ativo: item.ativo !== undefined ? item.ativo : true,
          }));
          setUsuarios(formattedUsuarios);
        }
      } catch (error) {
        console.error('Erro ao buscar usuários do Google Sheets:', error);
      }
    };

    fetchUsuariosFromSheet();
  }, []);

  // Função para carregar todos leads (normais, fechados e perdidos)
  const fetchLeadsAllFromSheet = async () => {
    try {
      // Leads normais
      const responseLeads = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?action=getLeads');
      const dataLeads = await responseLeads.json();

      // Leads fechados
      const responseFechados = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?action=getLeadsFechados');
      const dataFechados = await responseFechados.json();

      // Leads perdidos
      const responsePerdidos = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?action=getLeadsPerdidos');
      const dataPerdidos = await responsePerdidos.json();

      if (Array.isArray(dataLeads) && !leadSelecionado) {
        const formattedLeads = dataLeads.map((item, index) => ({
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
        setLeads(formattedLeads);
      }

      if (Array.isArray(dataFechados)) {
        const formattedFechados = dataFechados.map((item, index) => ({
          id: item.id ? Number(item.id) : index + 1,
          name: item.name || item.Name || '',
          vehicleModel: item.vehiclemodel || item.vehicleModel || '',
          vehicleYearModel: item.vehicleYearModel || item.vehicleYearModel || '',
          city: item.city || '',
          phone: item.phone || item.Telefone || '',
          insuranceType: item.insuranceType || '',
          status: item.status || 'Fechado',
          confirmado: item.confirmado === 'true' || item.confirmado === true,
          insurer: item.insurer || '',
          insurerConfirmed: item.insurerConfirmed === 'true' || item.insurerConfirmed === true,
          usuarioId: item.usuarioId ? Number(item.usuarioId) : null,
          premioLiquido: item.premioLiquido || '',
          comissao: item.comissao || '',
          parcelamento: item.parcelamento || '',
          createdAt: item.createdAt || new Date().toISOString(),
        }));
        setLeadsFechados(formattedFechados);
      }

      if (Array.isArray(dataPerdidos)) {
        const formattedPerdidos = dataPerdidos.map((item, index) => ({
          id: item.id ? Number(item.id) : index + 1,
          name: item.name || item.Name || '',
          vehicleModel: item.vehiclemodel || item.vehicleModel || '',
          vehicleYearModel: item.vehicleYearModel || item.vehicleYearModel || '',
          city: item.city || '',
          phone: item.phone || item.Telefone || '',
          insuranceType: item.insuranceType || '',
          status: item.status || 'Perdido',
          confirmado: item.confirmado === 'true' || item.confirmado === true,
          insurer: item.insurer || '',
          insurerConfirmed: item.insurerConfirmed === 'true' || item.insurerConfirmed === true,
          usuarioId: item.usuarioId ? Number(item.usuarioId) : null,
          premioLiquido: item.premioLiquido || '',
          comissao: item.comissao || '',
          parcelamento: item.parcelamento || '',
          createdAt: item.createdAt || new Date().toISOString(),
        }));
        setLeadsPerdidos(formattedPerdidos);
      }
    } catch (error) {
      console.error('Erro ao buscar leads do Google Sheets:', error);
      if (!leadSelecionado) {
        setLeads([]);
        setLeadsFechados([]);
        setLeadsPerdidos([]);
      }
    }
  };

  useEffect(() => {
    fetchLeadsAllFromSheet();

    const interval = setInterval(() => {
      fetchLeadsAllFromSheet();
    }, 5000);

    return () => clearInterval(interval);
  }, [leadSelecionado]);

  // Função para salvar os dados no Google Sheets (envio de updates)
  const salvarDadosNoSheets = async (action, payload) => {
    try {
      const params = new URLSearchParams();
      params.append('action', action);
      for (const key in payload) {
        if (payload[key] !== undefined && payload[key] !== null) {
          params.append(key, payload[key]);
        }
      }

      const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?' + params.toString());
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Erro ao salvar dados no Google Sheets:', error);
      return null;
    }
  };
  // --- FIM sincronização leads via Google Sheets ---


  // Funções que atualizam leads e sincronizam com o Google Sheets

  const atualizarStatusLead = async (id, novoStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, status: novoStatus, confirmado: true } : lead
      )
    );

    await salvarDadosNoSheets('updateStatusLead', { id, status: novoStatus });

    if (novoStatus === 'Fechado') {
      setUltimoFechadoId(id);
      // Também pode ser necessário mover o lead para leadsFechados? Isso deve ser tratado no backend/script.
    }
  };

  const atualizarSeguradoraLead = async (id, seguradora) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, insurer: seguradora } : lead
      )
    );
    await salvarDadosNoSheets('updateInsurerLead', { id, insurer: seguradora });
  };

  const confirmarSeguradoraLead = async (id) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, insurerConfirmed: true } : lead
      )
    );
    await salvarDadosNoSheets('confirmInsurerLead', { id });
  };

  const atualizarDetalhesLeadFechado = async (id, campo, valor) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, [campo]: valor } : lead
      )
    );
    await salvarDadosNoSheets('updateDetalheLeadFechado', { id, campo, valor });
  };

  const transferirLead = async (leadId, usuarioId) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, usuarioId } : lead
      )
    );
    await salvarDadosNoSheets('transferLead', { id: leadId, usuarioId });
  };

  const adicionarUsuario = async (usuario) => {
    const novoUsuario = { ...usuario, id: usuarios.length + 1 };
    setUsuarios((prev) => [...prev, novoUsuario]);

    await salvarDadosNoSheets('addUsuario', novoUsuario);
  };

  const atualizarStatusUsuario = async (id, novoStatus = null, novoTipo = null) => {
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

    await salvarDadosNoSheets('updateUsuario', { id, status: novoStatus, tipo: novoTipo });
  };


  const [ultimoFechadoId, setUltimoFechadoId] = useState(null);

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
                leads={
                  isAdmin
                    ? leads
                    : leads.filter((lead) => lead.usuarioId === usuarioLogado.id)
                }
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
              />
            }
          />
          <Route
            path="/leads-fechados"
            element={
              <LeadsFechados
                leads={leadsFechados.length > 0 ? leadsFechados : leads.filter(l => l.status === 'Fechado')}
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
                leads={leadsPerdidos.length > 0 ? leadsPerdidos : leads.filter(l => l.status === 'Perdido')}
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
