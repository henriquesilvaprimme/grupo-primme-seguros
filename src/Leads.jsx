import React, { useEffect, useState } from 'react';

const GOOGLE_SHEETS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgeZteouyVWzrCvgHHQttx-5Bekgs_k-5EguO9Sn2p-XFrivFg9S7_gGKLdoDfCa08/exec';

const Leads = ({ leads: leadsProp, usuarios, onUpdateStatus, transferirLead, usuarioLogado }) => {
  const [leads, setLeads] = useState([]);  // Começa vazio, vai buscar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Dados podem vir diretamente como array ou dentro de data.contents
      const fetchedLeads = Array.isArray(data)
        ? data
        : data && data.contents
        ? data.contents
        : [];

      if (!fetchedLeads || fetchedLeads.length === 0) {
        console.warn('Nenhum lead encontrado na resposta.');
      }

      setLeads(fetchedLeads);
    } catch (err) {
      setError('Erro ao carregar leads: ' + err.message);
      console.error('Erro ao carregar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Não sobrescrever leads buscados com props que podem estar vazias
  // Se quiser usar leadsProp, avalie a lógica para não sobrescrever fetch

  const handleStatusChange = (id, novoStatus) => {
    onUpdateStatus(id, novoStatus);
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status: novoStatus } : lead))
    );
  };

  if (loading) return <p>Carregando leads...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Leads</h2>
      {leads.length === 0 && <p>Nenhum lead encontrado.</p>}

      <div className="space-y-4">
        {leads.map((lead) => (
          <div
            key={lead.id || lead.phone || Math.random()}
            className="border rounded p-4 shadow hover:shadow-lg transition cursor-pointer"
          >
            <h3 className="text-lg font-bold">{lead.name}</h3>
            <p>
              Veículo: {lead.vehicleModel} - {lead.vehicleYearModel}
            </p>
            <p>Cidade: {lead.city}</p>
            <p>Telefone: {lead.phone}</p>
            <p>Tipo Seguro: {lead.insuranceType}</p>
            <p>Status: {lead.status || 'Selecione o status'}</p>

            <select
              value={lead.status || ''}
              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
              className="mt-2 p-1 border rounded"
            >
              <option value="">Selecione o status</option>
              <option value="Em contato">Em contato</option>
              <option value="Sem contato">Sem contato</option>
              <option value="Fechado">Fechado</option>
              <option value="Perdido">Perdido</option>
            </select>

            <div className="mt-2">
              <label htmlFor={`usuario-transferir-${lead.id}`} className="mr-2">
                Transferir para:
              </label>
              <select
                id={`usuario-transferir-${lead.id}`}
                value={lead.usuarioId || ''}
                onChange={(e) => transferirLead(lead.id, Number(e.target.value))}
                className="p-1 border rounded"
              >
                <option value="">Nenhum</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome} ({u.usuario})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leads;
