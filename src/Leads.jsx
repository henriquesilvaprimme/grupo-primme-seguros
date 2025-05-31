import React, { useState, useEffect } from 'react';

const statusOptions = [
  'Selecione o status',
  'Fechado',
  'Perdido',
  'Em contato',
  'Sem contato',
  '',
];

const Leads = ({
  leads,
  usuarios,
  onUpdateStatus,
  transferirLead,
  usuarioLogado,
  leadsNaoAtribuidos,
  onAbrirLead,
}) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [seguradoraFilter, setSeguradoraFilter] = useState('');
  const [filteredLeads, setFilteredLeads] = useState([]);

  useEffect(() => {
    let filtrados = leads;

    if (statusFilter && statusFilter !== '') {
      filtrados = filtrados.filter((lead) => (lead.status || '') === statusFilter);
    }

    if (seguradoraFilter && seguradoraFilter !== '') {
      filtrados = filtrados.filter((lead) =>
        lead.insurer ? lead.insurer.toLowerCase().includes(seguradoraFilter.toLowerCase()) : false
      );
    }

    setFilteredLeads(filtrados);
  }, [leads, statusFilter, seguradoraFilter]);

  // Checa se lead está na lista de leads não atribuídos (por id ou telefone)
  const isLeadNaoAtribuido = (lead) => {
    if (!leadsNaoAtribuidos || leadsNaoAtribuidos.length === 0) return false;

    return leadsNaoAtribuidos.some((na) =>
      na.id === lead.id || na.phone === lead.phone
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Leads</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="">Todos os Status</option>
          {statusOptions.filter(Boolean).map((status) => (
            <option key={status} value={status}>
              {status === '' ? 'Sem status' : status}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filtrar por seguradora"
          value={seguradoraFilter}
          onChange={(e) => setSeguradoraFilter(e.target.value)}
          className="border px-3 py-1 rounded"
        />
      </div>

      <div className="overflow-auto max-h-[70vh]">
        {filteredLeads.length === 0 && (
          <p className="text-gray-500">Nenhum lead encontrado para os filtros selecionados.</p>
        )}

        <ul className="space-y-3">
          {filteredLeads.map((lead) => {
            const isNaoAtribuido = isLeadNaoAtribuido(lead);

            return (
              <li
                key={lead.id}
                className={`border rounded p-3 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between
                ${
                  isNaoAtribuido
                    ? 'bg-yellow-100 border-yellow-400'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex-1">
                  <p className="font-semibold">{lead.name || '—'}</p>
                  <p className="text-sm text-gray-600">
                    {lead.phone || 'Sem telefone'} - {lead.vehicleModel || 'Modelo?'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium">{lead.status || 'Sem status'}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Seguradora: <span className="font-medium">{lead.insurer || '-'}</span>
                  </p>
                </div>

                <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:gap-3 mt-3 md:mt-0">
                  <select
                    value={lead.status || ''}
                    onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                    className="border rounded px-2 py-1"
                    title="Alterar status do lead"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === '' ? 'Sem status' : opt}
                      </option>
                    ))}
                  </select>

                  <select
                    value={lead.usuarioId || ''}
                    onChange={(e) => {
                      const novoUsuarioId = Number(e.target.value);
                      if (novoUsuarioId !== lead.usuarioId) {
                        transferirLead(lead.id, novoUsuarioId);
                      }
                    }}
                    className="border rounded px-2 py-1"
                    title="Transferir lead para usuário"
                  >
                    <option value="">Sem responsável</option>
                    {usuarios.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nome}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => onAbrirLead(lead)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
                    title="Abrir lead"
                  >
                    Abrir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Leads;
