import React from 'react';

const Dashboard = ({ leads }) => {
  // Contadores existentes
  const totalLeads = leads.length;
  const leadsFechados = leads.filter(lead => lead.status === 'Fechado').length;
  const leadsPerdidos = leads.filter(lead => lead.status === 'Perdido').length;
  const leadsEmContato = leads.filter(lead => lead.status === 'Em Contato').length;
  const leadsSemContato = leads.filter(lead => lead.status === 'Sem Contato').length;

  // Novos contadores (exemplo: filtragem por insuranceType)
  const portoSeguro = leads.filter(lead => lead.insuranceType === 'Porto Seguro').length;
  const azulSeguros = leads.filter(lead => lead.insuranceType === 'Azul Seguros').length;
  const itauSeguros = leads.filter(lead => lead.insuranceType === 'Itau Seguros').length;
  const demais = leads.filter(
    lead =>
      lead.insuranceType !== 'Porto Seguro' &&
      lead.insuranceType !== 'Azul Seguros' &&
      lead.insuranceType !== 'Itau Seguros'
  ).length;

  // Estilo comum para as caixas
  const boxStyle = {
    padding: '10px',
    borderRadius: '5px',
    flex: 1,
    color: '#fff',
    textAlign: 'center'
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>

      {/* Primeira linha de contadores */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ ...boxStyle, backgroundColor: '#eee', color: '#333' }}>
          <h3>Total de Leads</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalLeads}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#4CAF50' }}>
          <h3>Leads Fechados</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{leadsFechados}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#F44336' }}>
          <h3>Leads Perdidos</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{leadsPerdidos}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#FF9800' }}>
          <h3>Em Contato</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{leadsEmContato}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#9E9E9E' }}>
          <h3>Sem Contato</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{leadsSemContato}</p>
        </div>
      </div>

      {/* Segunda linha de contadores (novos) */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ ...boxStyle, backgroundColor: '#003366' }}>
          <h3>Porto Seguro</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{portoSeguro}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#87CEFA' }}>
          <h3>Azul Seguros</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{azulSeguros}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#FF8C00' }}>
          <h3>Itau Seguros</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{itauSeguros}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#4CAF50' }}>
          <h3>Demais Seguradoras</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{demais}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
