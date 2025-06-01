import React, { useState } from 'react';

const Lead = ({ lead, onUpdateStatus, disabledConfirm }) => {
  const [status, setStatus] = useState(lead.status || '');

  const enviarAtualizacaoParaSheets = async () => {
  try {
    const urlScript = 'https://script.google.com/macros/s/AKfycbwgeZteouyVWzrCvgHHQttx-5Bekgs_k-5EguO9Sn2p-XFrivFg9S7_gGKLdoDfCa08/exec';

    // Atualiza o lead na aba Leads
    const responseEditar = await fetch(urlScript, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'editarLead',
        payload: {
          ID: lead.id,
          name: lead.name,
          vehicleModel: lead.vehicleModel,
          vehicleYearModel: lead.vehicleYearModel,
          city: lead.city,
          phone: lead.phone,
          insuranceType: lead.insuranceType,
          Status: status,
          Responsável: lead.vendedor || '',
          data: lead.data || new Date().toISOString()
        }
      })
    });
    const dataEditar = await responseEditar.json();
    console.log('Resposta editarLead:', dataEditar);

    if (status === 'Fechado' || status === 'Perdido') {
      const responseMover = await fetch(urlScript, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'moverLead',
          payload: {
            ID: lead.id,
            Status: status
          }
        })
      });
      const dataMover = await responseMover.json();
      console.log('Resposta moverLead:', dataMover);

      if (dataMover.success) {
        // Só agora atualiza o estado local, se usar callback, chame aqui
        onUpdateStatus(lead.id, status);
      } else {
        alert('Erro ao mover lead no backend');
      }
    } else {
      // status normal, só atualiza local
      onUpdateStatus(lead.id, status);
    }
  } catch (error) {
    console.error('Erro na comunicação com o backend:', error);
    alert('Erro ao salvar lead. Tente novamente.');
  }
};

  // Bloqueia apenas quando o status for Fechado ou Perdido
  const isBlocked = lead.status === 'Fechado' || lead.status === 'Perdido';

  // Define a cor do card conforme o status
  const cardColor = (() => {
    switch (status) {
      case 'Fechado':
        return '#d4edda'; // verde claro
      case 'Perdido':
        return '#f8d7da'; // vermelho claro
      case 'Em Contato':
        return '#fff3cd'; // laranja claro
      case 'Sem Contato':
        return '#e2e3e5'; // cinza claro
      case 'Selecione o status':
      case '':
      default:
        return '#ffffff'; // branco para status vazio ou "Selecione o status"
    }
  })();

  const handleConfirm = () => { 
  if (!status || status === 'Selecione o status') {
    alert('Selecione um status antes de confirmar!');
    return;
  }
  onUpdateStatus(lead.id, status);
  enviarAtualizacaoParaSheets(); // <- Alterado para confirmar atualizacao
};

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '5px',
        backgroundColor: cardColor
      }}
    >      
      <p><strong>Nome:</strong> {lead.name}</p>
      <p><strong>Modelo do veículo:</strong> {lead.vehicleModel}</p>
      <p><strong>Ano/Modelo:</strong> {lead.vehicleYearModel}</p>
      <p><strong>Cidade:</strong> {lead.city}</p>
      <p><strong>Telefone:</strong> {lead.phone}</p>
      <p><strong>Tipo de Seguro:</strong> {lead.insuranceType}</p>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={isBlocked}
        style={{
          marginRight: '10px',
          padding: '8px',
          border: '2px solid #ccc',
          borderRadius: '4px',
          minWidth: '160px'
        }}
      >
        <option value="">Selecione o status</option>
        <option value="Em Contato">Em Contato</option>
        <option value="Fechado">Fechado</option>
        <option value="Perdido">Perdido</option>
        <option value="Sem Contato">Sem Contato</option>
      </select>

      {!isBlocked ? (
        <button
          onClick={handleConfirm}
          disabled={disabledConfirm || !status || status === 'Selecione o status'}
          style={{
            padding: '8px 16px',
            backgroundColor: disabledConfirm || !status || status === 'Selecione o status' ? '#aaa' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: disabledConfirm || !status || status === 'Selecione o status' ? 'not-allowed' : 'pointer'
          }}
        >
          Confirmar
        </button>
      ) : (
        <span style={{ marginLeft: '10px', color: 'green', fontWeight: 'bold' }}>
          Status confirmado
        </span>
      )}
    </div>
  );
};

export default Lead;
