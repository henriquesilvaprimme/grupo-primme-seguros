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

  // SINCRONIZAÇÃO DOS DADOS VIA GOOGLE SHEETS
  const [leads, setLeads] = useState([]);
  const [leadsFechados, setLeadsFechados] = useState([]);
  const [leadsPerdidos, setLeadsPerdidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [leadSelecionado, setLeadSelecionado] = useState(null);

  // Para saber o último lead fechado (para destaque)
  const [ultimoFechadoId, setUltimoFechadoId] = useState(null);

  // FUNÇÃO PARA FORMATAR LEAD RECEBIDO DO GOOGLE SHEETS
  const formatLead = (item, idDefault) => ({
    id: item.id ? Number(item.id) : idDefault,
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
  });

  // FETCH DOS LEADS, FECHADOS, PERDIDOS E USUÁRIOS
  const fetchDataFromSheet = async () => {
    try {
      // Leads (ativos)
      const resLeads = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?action=getLeads');
      const dataLeads = await resLeads.json();

      // Leads Fechados
      const resFechados = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?action=getLeadsFechados');
      const dataFechados = await resFechados.json();

      // Leads Perdidos
      const resPerdidos = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?action=getLeadsPerdidos');
      const dataPerdidos = await resPerdidos.json();

      // Usuários
      const resUsuarios = await fetch(GOOGLE_SHEETS_SCRIPT_URL + '?action=getUsuarios');
      const dataUsuarios = await resUsuarios.json();

      // Formatar e atualizar somente se não tiver lead selecionado (para não perder edição)
      if (!leadSelecionado) {
        // Leads
        if (Array.isArray(dataLeads)) {
          setLeads(dataLeads.map((item, i) => formatLead(item, i + 1)));
        } else {
          setLeads([]);
        }

        // Leads Fechados
        if (Array.isArray(dataFechados)) {
          setLeadsFechados(dataFechados.map((item, i) => formatLead(item, i + 1)));
        } else {
          setLeadsFechados([]);
        }

        // Leads Perdidos
        if (Array.isArray(dataPerdidos)) {
          setLeadsPerdidos(dataPerdidos.map((item, i) => formatLead(item, i + 1)));
        } else {
          setLeadsPerdidos([]);
        }

        // Usuários
        if (Array.isArray(dataUsuarios)) {
          setUsuarios(dataUsuarios.map((user, i) => ({
            id: user.id ? Number(user.id) : i + 1,
            nome: user.nome || '',
            email: user.email || '',
            senha: user.senha || '',
            status: user.status || 'Ativo',
            tipo: user.tipo || 'Usuario',
            ativo: user.ativo || 'Ativo',
            usuario: user.usuario || '', // login
          })));
        } else {
          setUsuarios([]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do Google Sheets:', error);
      if (!leadSelecionado) {
        setLeads([]);
        setLeadsFechados([]);
        setLeadsPerdidos([]);
        setUsuarios([]);
      }
    }
  };

  useEffect(() => {
    fetchDataFromSheet();
    const interval = setInterval(() => {
      fetchDataFromSheet();
    }, 5000);
    return () => clearInterval(interval);
  }, [leadSelecionado]);

  // Funções para atualizar status e mover leads entre listas

  // Atualiza status e, se for fechado/perdido, move o lead para a aba correta
  const atualizarStatusLead = (id, novoStatus) => {
    if (novoStatus === 'Fechado') {
      // Encontrar lead atual
      const lead = leads.find(l => l.id === id);
      if (!lead) return;

      // Remove lead da lista leads e adiciona em leadsFechados com status atualizado e confirmado
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setLeadsFechados((prev) => [...prev, { ...lead, status: novoStatus, confirmado: true }]);
      setUltimoFechadoId(id);

      // Também, se estiver em leadsPerdidos, remover de lá (possível edge case)
      setLeadsPerdidos((prev) => prev.filter((l) => l.id !== id));
    } else if (novoStatus === 'Perdido') {
      const lead = leads.find(l => l.id === id);
      if (!lead) return;

      setLeads((prev) => prev.filter((l) => l.id !== id));
      setLeadsPerdidos((prev) => [...prev, { ...lead, status: novoStatus, confirmado: true }]);

      // Remover de leadsFechados caso exista lá
      setLeadsFechados((prev) => prev.filter((l) => l.id !== id));
    } else {
      // Status normal, atualizar dentro da lista leads
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, status: novoStatus, confirmado: true } : lead
        )
      );
    }
  };

  // Atualiza seguradora no lead fechado (na lista leadsFechados)
  const atualizarSeguradoraLead = (id, seguradora) => {
    setLeadsFechados((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, insurer: seguradora } : lead
      )
    );
  };

  // Confirma seguradora no lead fechado
  const confirmarSeguradoraLead = (id) => {
    setLeadsFechados((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, insurerConfirmed: true } : lead
      )
    );
  };

  // Atualiza campos extras do lead fechado
  const atualizarDetalhesLeadFechado = (id, campo, valor) => {
    setLeadsFechados((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, [campo]: valor } : lead
      )
    );
  };

  // Transferir lead para outro usuário (na lista correta)
  // Recebe o id do lead e id do usuário destino
  const transferirLead = (leadId, usuarioId) => {
    // Procurar em todas as listas qual contém o lead
    let encontrou = false;

    setLeads((prev) => {
      const updated = prev.map((lead) => {
        if (lead.id === leadId) {
          encontrou = true;
          return { ...lead, usuarioId };
        }
        return lead;
      });
      return updated;
    });
    if (encontrou) return;

    setLeadsFechados((prev) => {
      const updated = prev.map((lead) => {
        if (lead.id === leadId) {
          encontrou = true;
          return { ...lead, usuarioId };
        }
        return lead;
      });
      return updated;
    });
    if (encontrou) return;

    setLeadsPerdidos((prev) => {
      const updated = prev.map((lead) => {
        if (lead.id === leadId) {
          return { ...lead, usuarioId };
        }
        return lead;
      });
      return updated;
    });
  };

  // Atualiza status e/ou tipo de usuário
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

  // Adicionar novo usuário
  const adicionarUsuario = (usuario) => {
    setUsuarios((prev) => [...prev, { ...usuario, id: prev.length + 1 }]);
  };

  // Abre lead e direciona para a rota correta
  const onAbrirLead = (lead) => {
    setLeadSelecionado(lead);

    let path = '/leads';
    if (lead.status === 'Fechado') path = '/leads-fechados';
    else if (lead.status === 'Perdido') path = '/leads-perdidos';

    navigate(path);
  };

  // Login básico com validação
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
                    ? [...leads, ...leadsFechados, ...leadsPerdidos]
                    : [...leads, ...leadsFechados, ...leadsPerdidos].filter(
                        (lead) => lead.usuarioId === usuarioLogado.id
                      )
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
                leads={isAdmin ? leadsFechados : leadsFechados.filter((lead) => lead.usuarioId === usuarioLogado.id)}
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
                leads={isAdmin ? leadsPerdidos : leadsPerdidos.filter((lead) => lead.usuarioId === usuarioLogado.id)}
                usuarios={usuarios}
                onAbrirLead={onAbrirLead}
                leadSelecionado={leadSelecionado}
              />
            }
          />
          <Route path="/buscar-lead" element={<BuscarLead leads={[...leads, ...leadsFechados, ...leadsPerdidos]} />} />
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
          <Route path="/ranking" element={<Ranking usuarios={usuarios} leads={[...leads, ...leadsFechados, ...leadsPerdidos]} />} />
          <Route path="*" element={<h1 style={{ padding: 20 }}>Página não encontrada</h1>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
