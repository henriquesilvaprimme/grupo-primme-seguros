import React, { useEffect, useState } from 'react';
import Lead from './Lead'; // seu componente Lead já enviado anteriormente

const ENDPOINT_GAS = 'https://script.google.com/macros/s/SEU_DEPLOY_ID/exec';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [usuario, setUsuario] = useState(''); // para atribuir lead
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Buscar leads não atribuídos do GAS
  const buscarLeadsNaoAtribuidos = async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(ENDPOINT_GAS, {
        method: 'POST',
        body: JSON.stringify({ acao: 'listarLeadsNaoAtribuidos' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.status === 'ok') {
        setLeads(json.leads.map(lead => ({
          id: lead.id,
          data: lead.data,
          status: lead.data[/* índice da coluna status no GAS */] || '',
          // Mapear os campos conforme sua estrutura da planilha
          name: lead.data[/* índice do nome */],
          vehicleModel: lead.data[/* índice modelo veículo */],
          vehicleYearModel: lead.data[/* índice ano/modelo */],
          city: lead.data[/* índice cidade */],
          phone: lead.data[/* índice telefone */],
          insuranceType: lead.data[/* índice tipo seguro */],
          responsavel: lead.data[/* índice responsável */] || ''
        })));
      } else {
        setErro(json.mensagem || 'Erro ao buscar leads');
      }
    } catch (error) {
      setErro(error.message || 'Erro na comunicação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarLeadsNaoAtribuidos();
  }, []);

  // Atribuir lead a um usuário
  const atribuirLead = async (leadId, usuario) => {
    try {
      const res = await fetch(ENDPOINT_GAS, {
        method: 'POST',
        body: JSON.stringify({ acao: 'atribuirLead', leadId, usuario }),
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.status === 'ok') {
        buscarLeadsNaoAtribuidos(); // atualizar lista
      } else {
        alert('Erro ao atribuir lead: ' + (json.mensagem || ''));
      }
    } catch (error) {
      alert('Erro na comunicação: ' + error.message);
    }
  };

  // Atualizar status do lead
  const atualizarStatus = async (leadId, novoStatus) => {
    try {
      const res = await fetch(ENDPOINT_GAS, {
        method: 'POST',
        body: JSON.stringify({ acao: 'atualizarStatusLead', leadId, novoStatus }),
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.status === 'ok') {
        buscarLeadsNaoAtribuidos(); // atualizar lista após status
      } else {
        alert('Erro ao atualizar status: ' + (json.mensagem || ''));
      }
    } catch (error) {
      alert('Erro na comunicação: ' + error.message);
    }
  };

  // Paginação simples
  const totalPaginas = Math.ceil(leads.length / itensPorPagina);
  const leadsPagina = leads.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  return (
    <div>
      <h2>Leads Não Atribuídos</h2>
      {loading && <p>Carregando leads...</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {!loading && !erro && leadsPagina.length === 0 && <p>Não há leads não atribuídos.</p>}

      {leadsPagina.map(lead => (
        <Lead
          key={lead.id}
          lead={lead}
          onUpdateStatus={atualizarStatus}
          disabledConfirm={false}
        />
      ))}

      {/* Exemplo para atribuir usuário (básico) */}
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Seu nome para atribuir"
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button
          onClick={() => {
            if (!usuario) {
              alert('Digite seu nome para atribuir o lead');
              return;
            }
            if (leadsPagina.length === 0) {
              alert('Nenhum lead na página para atribuir');
              return;
            }
            atribuirLead(leadsPagina[0].id, usuario);
          }}
        >
          Atribuir primeiro lead da página
        </button>
      </div>

      {/* Paginação */}
      <div style={{ marginTop: 20 }}>
        <button
          disabled={paginaAtual <= 1}
          onClick={() => setPaginaAtual(paginaAtual - 1)}
          style={{ marginRight: 10 }}
        >
          Anterior
        </button>
        <span>Página {paginaAtual} de {totalPaginas}</span>
        <button
          disabled={paginaAtual >= totalPaginas}
          onClick={() => setPaginaAtual(paginaAtual + 1)}
          style={{ marginLeft: 10 }}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Leads;
