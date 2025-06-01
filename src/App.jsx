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

  // Usuários já iniciam com Admin fixo incluído
  const [usuarios, setUsuarios] = useState([
    {
      id: 0,
      usuario: 'admin',
      nome: 'Administrador',
      email: 'admin@example.com',
      senha: 'admin123',
      status: 'Ativo',
      tipo: 'Admin',
      ativo: true,
    },
  ]);

  // Sincroniza usuários do Sheets e mantém o admin fixo
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

          setUsuarios((prevUsuarios) => {
            // Verifica se admin já está no estado (deveria estar)
            const adminExists = prevUsuarios.some(u => u.usuario === 'admin');
            // Remove possível admin vindo do Sheets para evitar duplicidade
            const usuariosSemAdmin = formattedUsuarios.filter(u => u.usuario !== 'admin');
            if (adminExists) {
              // Mantém admin fixo + usuários do Sheets (sem admin duplicado)
              return [...prevUsuarios.filter(u => u.usuario === 'admin'), ...usuariosSemAdmin];
            } else {
              // Se por acaso não tinha admin, inclui admin fixo + todos os do Sheets
              return [
                {
                  id: 0,
                  usuario: 'admin',
                  nome: 'Administrador',
                  email: 'admin@example.com',
                  senha: 'admin123',
                  status: 'Ativo',
                  tipo: 'Admin',
                  ativo: true,
                },
                ...usuariosSemAdmin,
              ];
            }
          });
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
        lead.id === leadId ? { ...lead, usuarioId: usuarioId } : lead
      )
    );
    await salvarDadosNoSheets('transferirLead', { id: leadId, usuarioId });
  };

  // Login e autenticação

  const handleLogin = () => {
    const user = usuarios.find(
      (u) =>
        u.usuario.toLowerCase() === loginInput.toLowerCase() &&
        u.senha === senhaInput &&
        u.ativo === true
    );
    if (user) {
      setIsAuthenticated(true);
      setUsuarioLogado(user);
      setLoginInput('');
      setSenhaInput('');
      navigate('/');
    } else {
      alert('Usuário ou senha inválidos!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsuarioLogado(null);
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Usuário"
          value={loginInput}
          onChange={(e) => setLoginInput(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senhaInput}
          onChange={(e) => setSenhaInput(e.target.value)}
        />
        <button onClick={handleLogin}>Entrar</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar onLogout={handleLogout} usuarioLogado={usuarioLogado} />
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              usuarioLogado={usuarioLogado}
              leads={leads}
              leadsFechados={leadsFechados}
              leadsPerdidos={leadsPerdidos}
              atualizarStatusLead={atualizarStatusLead}
              atualizarSeguradoraLead={atualizarSeguradoraLead}
              confirmarSeguradoraLead={confirmarSeguradoraLead}
              atualizarDetalhesLeadFechado={atualizarDetalhesLeadFechado}
              transferirLead={transferirLead}
              usuarios={usuarios}
            />
          }
        />
        <Route
          path="/leads"
          element={<Leads leads={leads} usuarioLogado={usuarioLogado} />}
        />
        <Route
          path="/leadsfechados"
          element={
            <LeadsFechados
              leadsFechados={leadsFechados}
              atualizarDetalhesLeadFechado={atualizarDetalhesLeadFechado}
            />
          }
        />
        <Route
          path="/leadsperdidos"
          element={<LeadsPerdidos leadsPerdidos={leadsPerdidos} />}
        />
        <Route
          path="/buscarlead"
          element={<BuscarLead leads={leads} />}
        />
        <Route
          path="/criarusuario"
          element={<CriarUsuario usuarios={usuarios} setUsuarios={setUsuarios} />}
        />
        <Route
          path="/usuarios"
          element={<Usuarios usuarios={usuarios} setUsuarios={setUsuarios} />}
        />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
