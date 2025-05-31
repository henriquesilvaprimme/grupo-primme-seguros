import React from 'react';

const Dashboard = ({ leads }) => {
  // Status gerais
  const totalLeads      = leads.length;
  const leadsFechados   = leads.filter(l => l.status === 'Fechado').length;
  const leadsPerdidos   = leads.filter(l => l.status === 'Perdido').length;
  const leadsEmContato  = leads.filter(l => l.status === 'Em Contato').length;
  const leadsSemContato = leads.filter(l => l.status === 'Sem Contato').length;

  // Novos contadores por seguradora após confirmação
  const portoSeguroCount      = leads.filter(l => l.insurer === 'Porto Seguro'     && l.insurerConfirmed).length;
  const azulSegurosCount      = leads.filter(l => l.insurer === 'Azul Seguros'     && l.insurerConfirmed).length;
  const itauSegurosCount      = leads.filter(l => l.insurer === 'Itau Seguros'     && l.insurerConfirmed).length;
  const demaisSeguradorasCount= leads.filter(l =>
    l.insurerConfirmed &&
    l.insurer !== 'Porto Seguro' &&
    l.insurer !== 'Azul Seguros' &&
    l.insurer !== 'Itau Seguros'
  ).length;

  // Estilo base das caixas
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

      {/* Linha de status */}
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

      {/* Linha de seguradoras */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ ...boxStyle, backgroundColor: '#003366' }}>
          <h3>Porto Seguro</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{portoSeguroCount}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#87CEFA' }}>
          <h3>Azul Seguros</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{azulSegurosCount}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#FF8C00' }}>
          <h3>Itau Seguros</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{itauSegurosCount}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#4CAF50' }}>
          <h3>Demais Seguradoras</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{demaisSeguradorasCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
