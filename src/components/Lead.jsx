import React, { useState, useEffect } from 'react';

const Lead = ({
  lead,
  usuarioLogado,
  atualizarStatusLead,
  onAbrirLead,
  atualizarSeguradoraLead,
  confirmarSeguradoraLead,
  atualizarDetalhesLeadFechado,
}) => {
  const [statusLocal, setStatusLocal] = useState(lead.status || 'Selecione o status');
  const [seguradoraLocal, setSeguradoraLocal] = useState(lead.insurer || '');
  const [confirmadoLocal, setConfirmadoLocal] = useState(lead.confirmado || false);
  const [insurerConfirmedLocal, setInsurerConfirmedLocal] = useState(lead.insurerConfirmed || false);

  useEffect(() => {
    setStatusLocal(lead.status || 'Selecione o status');
    setSeguradoraLocal(lead.insurer || '');
    setConfirmadoLocal(lead.confirmado || false);
    setInsurerConfirmedLocal(lead.insurerConfirmed || false);
  }, [lead]);

  const handleStatusChange = (e) => {
    const novoStatus = e.target.value;
    setStatusLocal(novoStatus);
    atualizarStatusLead(lead.id, novoStatus);
    if (novoStatus !== 'Fechado') {
      // Se mudar para outro status, desconfirmar seguradora
      setInsurerConfirmedLocal(false);
    }
  };

  const handleSeguradoraChange = (e) => {
    const novaSeguradora = e.target.value;
    setSeguradoraLocal(novaSeguradora);
    atualizarSeguradoraLead(lead.id, novaSeguradora);
  };

  const handleConfirmarSeguradora = () => {
    setInsurerConfirmedLocal(true);
    confirmarSeguradoraLead(lead.id);
  };

  const handleDetalheChange = (campo, valor) => {
    atualizarDetalhesLeadFechado(lead.id, campo, valor);
  };

  // Cor da borda do lead conforme status para visual
  const bordaCor = () => {
    switch (statusLocal) {
      case 'Fechado':
        return 'border-green-500';
      case 'Perdido':
        return 'border-red-500';
      case 'Em contato':
        return 'border-yellow-400';
      case 'Sem contato':
        return 'border-gray-400';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div
      className={`border ${bordaCor()} rounded-lg p-4 mb-4 shadow-md bg-white`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">{lead.name}</h3>
        <button
          onClick={() => onAbrirLead(lead)}
          className="text-indigo-600 hover:underline"
        >
          Abrir
        </button>
      </div>

      <p><strong>Veículo:</strong> {lead.vehicleModel} - {lead.vehicleYearModel}</p>
      <p><strong>Cidade:</strong> {lead.city}</p>
      <p><strong>Telefone:</strong> {lead.phone}</p>
      <p><strong>Tipo de seguro:</strong> {lead.insuranceType}</p>

      {/* Status Lead */}
      <div className="mt-3">
        <label className="block font-semibold mb-1" htmlFor={`status-${lead.id}`}>
          Status
        </label>
        <select
          id={`status-${lead.id}`}
          value={statusLocal}
          onChange={handleStatusChange}
          className="w-full border border-gray-300 rounded-md p-2"
          disabled={usuarioLogado.tipo !== 'Admin' && usuarioLogado.id !== lead.usuarioId}
        >
          <option value="Selecione o status" disabled>
            Selecione o status
          </option>
          <option value="Fechado">Fechado</option>
          <option value="Perdido">Perdido</option>
          <option value="Em contato">Em contato</option>
          <option value="Sem contato">Sem contato</option>
        </select>
      </div>

      {/* Seguradora (exibe só se status for Fechado) */}
      {statusLocal === 'Fechado' && (
        <>
          <div className="mt-3">
            <label className="block font-semibold mb-1" htmlFor={`seguradora-${lead.id}`}>
              Seguradora
            </label>
            <input
              id={`seguradora-${lead.id}`}
              type="text"
              value={seguradoraLocal}
              onChange={handleSeguradoraChange}
              className="w-full border border-gray-300 rounded-md p-2"
              disabled={usuarioLogado.tipo !== 'Admin' && usuarioLogado.id !== lead.usuarioId}
            />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={insurerConfirmedLocal}
              onChange={handleConfirmarSeguradora}
              disabled={usuarioLogado.tipo !== 'Admin' && usuarioLogado.id !== lead.usuarioId}
              id={`confirmar-seguradora-${lead.id}`}
            />
            <label htmlFor={`confirmar-seguradora-${lead.id}`}>
              Confirmar seguradora
            </label>
          </div>

          {/* Campos adicionais para leads fechados */}
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="block font-semibold mb-1" htmlFor={`premio-${lead.id}`}>
                Prêmio Líquido
              </label>
              <input
                type="text"
                id={`premio-${lead.id}`}
                value={lead.premioLiquido || ''}
                onChange={(e) => handleDetalheChange('premioLiquido', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                disabled={usuarioLogado.tipo !== 'Admin' && usuarioLogado.id !== lead.usuarioId}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" htmlFor={`comissao-${lead.id}`}>
                Comissão
              </label>
              <input
                type="text"
                id={`comissao-${lead.id}`}
                value={lead.comissao || ''}
                onChange={(e) => handleDetalheChange('comissao', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                disabled={usuarioLogado.tipo !== 'Admin' && usuarioLogado.id !== lead.usuarioId}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" htmlFor={`parcelamento-${lead.id}`}>
                Parcelamento
              </label>
              <input
                type="text"
                id={`parcelamento-${lead.id}`}
                value={lead.parcelamento || ''}
                onChange={(e) => handleDetalheChange('parcelamento', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                disabled={usuarioLogado.tipo !== 'Admin' && usuarioLogado.id !== lead.usuarioId}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Lead;
