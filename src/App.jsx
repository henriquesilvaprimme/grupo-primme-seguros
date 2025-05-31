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

  // Leads estado inicial vazio; será carregado do GAS
  const [leads, setLeads] = useState([]);
  
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      usuario: '1',
      nome: 'Administrador 1',
      email: 'admin1@example.com',
      senha: '1',
      status: 'Ativo',
      tipo: 'Admin',
    },
    // ... (restante dos usuarios)
  ]);

  const [ultimoFechadoId, setUltimoFechadoId] = useState(null);
  const [leadSelecionado, setLeadSelecionado] = useState(null);

  // --- Buscar leads não atribuídos do GAS ao iniciar o app ---
  useEffect(() => {
    const fetchLeadsNaoAtribuidos = async () => {
      try {
        const url = `${GOOGLE_SHEETS_SCRIPT_URL}?acao=listarLeadsNaoAtribuidos`;
        const response = await fetch(url, { method: 'POST' });
        const json = await response.json();
        if (json.status === 'ok') {
          // Os dados da planilha vêm no formato array de arrays (data)
          // Precisamos converter para o formato leads esperado
          // Como seu GAS retorna array com objetos {id, row, data}
          // data = linha da planilha. Mapeie para os campos do lead
          const leadsFormatados = json.leads.map(item => {
            // Seu GAS retorna toda linha como item.data, mas não sabemos os headers
            // Para garantir sincronia, vamos definir os campos principais aqui:
            // Você pode ajustar os índices conforme o seu layout da planilha
            // Suponha:
            // id = item.data[0]
            // name = item.data[1]
            // vehicleModel = item.data[2]
            // vehicleYearModel = item.data[3]
            // city = item.data[4]
            // phone = item.data[5]
            // insuranceType = item.data[6]
            // status = item.data[7]
            // confirmado = item.data[8] (boolean)
            // insurer = item.data[9]
            // insurerConfirmed = item.data[10] (boolean)
            // usuarioId = item.data[11] (int)
            // premioLiquido = item.data[12]
            // comissao = item.data[13]
            // parcelamento = item.data[14]
            // createdAt = item.data[15]
            return {
              id: item.data[0],
              name: item.data[1],
              vehicleModel: item.data[2],
              vehicleYearModel: item.data[3],
              city: item.data[4],
              phone: item.data[5],
              insuranceType: item.data[6],
              status: item.data[7] || 'Selecione o status',
              confirmado: item.data[8] === 'true' || item.data[8] === true,
              insurer: item.data[9] || '',
              insurerConfirmed: item.data[10] === 'true' || item.data[10] === true,
              usuarioId: item.data[11] ? Number(item.data[11]) : null,
              premioLiquido: item.data[12] || '',
              comissao: item.data[13] || '',
              parcelamento: item.data[14] || '',
              createdAt: item.data[15] || '',
            };
          });
          setLeads(leadsFormatados);
        } else {
          console.error('Erro ao buscar leads do GAS:', json.mensagem);
        }
      } catch (error) {
        console.error('Erro na requisição para GAS:', error);
      }
    };

    fetchLeadsNaoAtribuidos();
  }, []);

  // Função para enviar dados para Google Sheets via Google Apps Script
  const enviarParaGoogleSheets = async (lead) => {
    if (!GOOGLE_SHEETS_SCRIPT_URL) {
      console.error('URL do Google Apps Script não configurada.');
      return;
    }

    try {
      const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: lead.id,
          name: lead.name,
          vehicleModel: lead.vehicleModel,
          vehicleYearModel: lead.vehicleYearModel,
          city: lead.city,
          phone: lead.phone,
          insuranceType: lead.insuranceType,
          status: lead.status,
          confirmado: lead.confirmado,
          insurer: lead.insurer,
          insurerConfirmed: lead.insurerConfirmed,
          usuarioId: lead.usuarioId,
          premioLiquido: lead.premioLiquido,
          comissao: lead.comissao,
          parcelamento: lead.parcelamento,
          createdAt: lead.createdAt,
        }),
      });

      if (response.ok) {
        console.log('Lead enviada para Google Sheets com sucesso!');
      } else {
        console.error('Erro ao enviar lead para Google Sheets:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao enviar lead para Google Sheets:', error);
    }
  };

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
      // Enviar lead fechada para Google Sheets
      const leadFechado = leads.find((lead) => lead.id === id);
      if (leadFechado) {
        enviarParaGoogleSheets({ ...leadFechado, status: novoStatus, confirmado: true });
      }
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
                leads={leads}
                usuarioLogado={usuarioLogado}
                atualizarStatusLead={atualizarStatusLead}
                onAbrirLead={onAbrirLead}
                leadSelecionado={leadSelecionado}
                setLeadSelecionado={setLeadSelecionado}
                atualizarSeguradoraLead={atualizarSeguradoraLead}
                confirmarSeguradoraLead={confirmarSeguradoraLead}
                atualizarDetalhesLeadFechado={atualizarDetalhesLeadFechado}
                transferirLead={transferirLead}
              />
            }
          />
          <Route
            path="/leads-fechados"
            element={
              <LeadsFechados
                leads={leads.filter((l) => l.status === 'Fechado')}
                usuarioLogado={usuarioLogado}
                onAbrirLead={onAbrirLead}
                leadSelecionado={leadSelecionado}
                setLeadSelecionado={setLeadSelecionado}
              />
            }
          />
          <Route
            path="/leads-perdidos"
            element={
              <LeadsPerdidos
                leads={leads.filter((l) => l.status === 'Perdido')}
                usuarioLogado={usuarioLogado}
                onAbrirLead={onAbrirLead}
                leadSelecionado={leadSelecionado}
                setLeadSelecionado={setLeadSelecionado}
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
              <Route path="/ranking" element={<Ranking usuarios={usuarios} leads={leads} />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
