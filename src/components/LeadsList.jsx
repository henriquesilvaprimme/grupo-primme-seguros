import React, { useState } from 'react';

export default function LeadsList({ leads }) {
  const [statusFilter, setStatusFilter] = useState('');

  const filteredLeads = leads.filter(lead =>
    statusFilter === '' || (lead.status && lead.status.toLowerCase() === statusFilter.toLowerCase())
  );

  const sortedLeads = filteredLeads.sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div>
      <label>
        Filtrar por status:
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos</option>
          <option value="fechado">Fechado</option>
          <option value="perdido">Perdido</option>
          <option value="em contato">Em contato</option>
          <option value="sem contato">Sem contato</option>
        </select>
      </label>

      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Modelo do Veículo</th>
            <th>Ano do Veículo</th>
            <th>Cidade</th>
            <th>Telefone</th>
            <th>Tipo de Seguro</th>
            <th>Data</th>
            <th>Responsável</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedLeads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.vehiclemodel}</td>
              <td>{lead.vehicleyearmodel}</td>
              <td>{lead.city}</td>
              <td>{lead.phone}</td>
              <td>{lead.insurancetype}</td>
              <td>{new Date(lead.data).toLocaleString()}</td>
              <td>{lead.responsavel}</td>
              <td>{lead.status || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
