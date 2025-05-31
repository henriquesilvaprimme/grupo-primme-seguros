import React, { useState, useEffect } from 'react';

// Função para buscar leads não atribuídos no GAS
async function buscarLeadsNaoAtribuidos() {
  const url = 'https://script.google.com/macros/s/SEU_DEPLOY_ID_AQUI/exec?acao=listarLeadsNaoAtribuidos';

  try {
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const data = await response.json();
    if (data.status !== 'ok') throw new Error(data.mensagem || 'Erro desconhecido');

    return data.leads; // Array de leads vindos do GAS
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    throw error;
  }
}

const LeadsFechados = ({ usuarios }) => {
  const [leads, setLeads] = useState([]); // leads do GAS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros iguais seu código original
  const [nomeInput, setNomeInput] = useState('');
  const [dataInput, setDataInput] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroData, setFiltroData] = useState('');

  // Carrega leads do GAS quando o componente monta
  useEffect(() => {
    async function carregarLeads() {
      setLoading(true);
      setError(null);
      try {
        const todosLeads = await buscarLeadsNaoAtribuidos();
        // Filtra somente os leads com status 'Fechado'
        const fechados = todosLeads.filter(lead => lead.status === 'Fechado');
        setLeads(fechados);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    carregarLeads();
  }, []);

  // Função para normalizar texto (remover acentos etc)
  const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,]/g, '')
      .trim();
  };

  const aplicarFiltroNome = () => {
    setFiltroNome(nomeInput.trim());
  };

  const aplicarFiltroData = () => {
    setFiltroData(dataInput);
  };

  // Aplica os filtros como no seu código
  const leadsFiltrados = leads.filter((lead) => {
    if (filtroNome) {
      const nomeNormalizado = normalizarTexto(lead.name);
      const filtroNormalizado = normalizarTexto(filtroNome);
      if (!nomeNormalizado.includes(filtroNormalizado)) {
        return false;
      }
    }
    if (filtroData) {
      if (!lead.createdAt || !lead.createdAt.startsWith(filtroData)) {
        return false;
      }
    }
    return true;
  });

  if (loading) return <p>Carregando leads fechados...</p>;
  if (error) return <p>Erro ao carregar leads: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Leads Fechados</h1>

      {/* Container filtros: nome centralizado, data canto direito */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {/* Filtro nome: centralizado */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: '1',
            justifyContent: 'center',
            minWidth: '280px',
          }}
        >
          <button
            onClick={aplicarFiltroNome}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginRight: '8px',
            }}
          >
            Filtrar
          </button>
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={nomeInput}
            onChange={(e) => setNomeInput(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              width: '220px',
              maxWidth: '100%',
            }}
            title="Filtrar leads pelo nome (contém)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') aplicarFiltroNome();
            }}
          />
        </div>

        {/* Filtro data: canto direito */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '230px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={aplicarFiltroData}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginRight: '8px',
            }}
          >
            Filtrar
          </button>
          <input
            type="date"
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              minWidth: '140px',
            }}
            title="Filtrar leads pela data exata de criação"
            onKeyDown={(e) => {
              if (e.key === 'Enter') aplicarFiltroData();
            }}
          />
        </div>
      </div>

      {leadsFiltrados.length === 0 ? (
        <p>Não há leads fechados que correspondam ao filtro aplicado.</p>
      ) : (
        leadsFiltrados.map(lead => {
          const containerStyle = {
            border: '2px solid #4CAF50',
            backgroundColor: '#e6f4ea',
            padding: '15px',
            marginBottom: '15px',
            borderRadius: '5px'
          };

          const responsavel = usuarios.find(u => u.id === lead.usuarioId);

          return (
            <div key={lead.id} style={containerStyle}>
              <h3>{lead.name}</h3>
              <p><strong>Modelo:</strong> {lead.vehicleModel}</p>
              <p><strong>Ano/Modelo:</strong> {lead.vehicleYearModel}</p>
              <p><strong>Cidade:</strong> {lead.city}</p>
              <p><strong>Telefone:</strong> {lead.phone}</p>
              <p><strong>Tipo de Seguro:</strong> {lead.insuranceType}</p>

              {responsavel && (
                <p style={{ marginTop: '10px', color: '#007bff' }}>
                  Transferido para <strong>{responsavel.nome}</strong>
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default LeadsFechados;
