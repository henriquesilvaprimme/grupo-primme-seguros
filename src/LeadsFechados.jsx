import React, { useState, useEffect } from 'react';

const LeadsFechados = ({ leads, usuarios, onUpdateInsurer, onConfirmInsurer, onUpdateDetalhes }) => {
  const fechados = leads.filter(lead => lead.status === 'Fechado');

  const [valores, setValores] = useState(() => {
    const inicial = {};
    fechados.forEach(lead => {
      inicial[lead.id] = {
        premioLiquido: lead.premioLiquido !== undefined ? Math.round(parseFloat(lead.premioLiquido) * 100) : 0,
        comissao: lead.comissao ? String(lead.comissao) : '',
        parcelamento: lead.parcelamento || '',
      };
    });
    return inicial;
  });

  useEffect(() => {
    setValores(prevValores => {
      const novoValores = { ...prevValores };
      fechados.forEach(lead => {
        if (!novoValores.hasOwnProperty(lead.id)) {
          novoValores[lead.id] = {
            premioLiquido: lead.premioLiquido !== undefined ? Math.round(parseFloat(lead.premioLiquido) * 100) : 0,
            comissao: lead.comissao ? String(lead.comissao) : '',
            parcelamento: lead.parcelamento || '',
          };
        }
      });
      return novoValores;
    });
  }, [fechados]);

  const [nomeInput, setNomeInput] = useState('');
  const [dataInput, setDataInput] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroData, setFiltroData] = useState('');

  const normalizarTexto = (texto) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .toLowerCase();

  const aplicarFiltroNome = () => {
    setFiltroNome(nomeInput.trim());
  };

  const aplicarFiltroData = () => {
    setFiltroData(dataInput);
  };

  const leadsFiltrados = fechados.filter(lead => {
    const nomeMatch = normalizarTexto(lead.name || '').includes(normalizarTexto(filtroNome || ''));
    const dataMatch = filtroData ? lead.createdAt?.startsWith(filtroData) : true;
    return nomeMatch && dataMatch;
  });

  const formatarMoeda = (valorCentavos) => {
    if (isNaN(valorCentavos) || valorCentavos === null) return '';
    return (valorCentavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePremioLiquidoChange = (id, valor) => {
    const somenteNumeros = valor.replace(/\D/g, '');

    if (somenteNumeros === '') {
      setValores(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          premioLiquido: 0,
        },
      }));
      return;
    }

    let valorCentavos = parseInt(somenteNumeros, 10);
    if (isNaN(valorCentavos)) valorCentavos = 0;

    setValores(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        premioLiquido: valorCentavos,
      },
    }));
  };

  const handlePremioLiquidoBlur = (id) => {
    const valorCentavos = valores[id]?.premioLiquido || 0;
    const valorReais = valorCentavos / 100;

    if (!isNaN(valorReais)) {
      onUpdateDetalhes(id, 'premioLiquido', valorReais);
    } else {
      onUpdateDetalhes(id, 'premioLiquido', '');
    }
  };

  const handleComissaoChange = (id, valor) => {
    const regex = /^(\d{0,2})(,?\d{0,1})?$/;

    if (valor === '' || regex.test(valor)) {
      const valorLimitado = valor.slice(0, 4);

      setValores(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          comissao: valorLimitado,
        },
      }));

      const valorFloat = parseFloat(valorLimitado.replace(',', '.'));
      onUpdateDetalhes(id, 'comissao', isNaN(valorFloat) ? '' : valorFloat);
    }
  };

  const handleParcelamentoChange = (id, valor) => {
    setValores(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        parcelamento: valor,
      },
    }));
    onUpdateDetalhes(id, 'parcelamento', valor);
  };

  const inputWrapperStyle = {
    position: 'relative',
    width: '100%',
    marginBottom: '8px',
  };

  const prefixStyle = {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#555',
    fontWeight: 'bold',
    pointerEvents: 'none',
    userSelect: 'none',
  };

  const inputWithPrefixStyle = {
    paddingLeft: '30px',
    paddingRight: '8px',
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '4px',
    height: '36px',
    boxSizing: 'border-box',
    textAlign: 'right',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Leads Fechados</h1>

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
              height: '36px',
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
              height: '36px',
              fontSize: '14px',
            }}
            title="Filtrar leads pelo nome (contém)"
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
              height: '36px',
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
              height: '36px',
              fontSize: '14px',
            }}
            title="Filtrar leads pela data exata de criação"
          />
        </div>
      </div>

      {leadsFiltrados.length === 0 ? (
        <p>Não há leads fechados que correspondam ao filtro aplicado.</p>
      ) : (
        leadsFiltrados.map((lead) => {
          const containerStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px',
            marginBottom: '15px',
            borderRadius: '5px',
            backgroundColor: lead.insurerConfirmed ? '#e6f4ea' : '#fff',
            border: lead.insurerConfirmed ? '2px solid #4CAF50' : '1px solid #ddd',
          };

          const responsavel = usuarios.find((u) => u.id === lead.usuarioId);

          const isButtonDisabled =
            !lead.insurer ||
            !valores[lead.id]?.premioLiquido ||
            valores[lead.id]?.premioLiquido === 0 ||
            !valores[lead.id]?.comissao ||
            valores[lead.id]?.comissao === '' ||
            !valores[lead.id]?.parcelamento ||
            valores[lead.id]?.parcelamento === '';

          return (
            <div key={lead.id} style={containerStyle}>
              <div style={{ flex: 1 }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '250px' }}>
                <select
                  value={lead.insurer}
                  onChange={(e) => onUpdateInsurer(lead.id, e.target.value)}
                  disabled={lead.insurerConfirmed}
                  style={{
                    padding: '8px',
                    border: '2px solid #ccc',
                    borderRadius: '4px',
                    width: '100%',
                    marginBottom: '8px',
                  }}
                >
                  <option value="">Selecione a seguradora</option>
                  <option value="Porto Seguro">Porto Seguro</option>
                  <option value="Azul Seguros">Azul Seguros</option>
                  <option value="Itau Seguros">Itau Seguros</option>
                  <option value="Demais Seguradoras">Demais Seguradoras</option>
                </select>

                <div style={inputWrapperStyle}>
                  <span style={prefixStyle}>R$</span>
                  <input
                    type="text"
                    placeholder="Prêmio Líquido"
                    value={formatarMoeda(valores[lead.id]?.premioLiquido)}
                    onChange={(e) => handlePremioLiquidoChange(lead.id, e.target.value)}
                    onBlur={() => handlePremioLiquidoBlur(lead.id)}
                    disabled={lead.insurerConfirmed}
                    style={inputWithPrefixStyle}
                  />
                </div>

                <div style={inputWrapperStyle}>
                  <span style={prefixStyle}>%</span>
                  <input
                    type="text"
                    placeholder="Comissão (%)"
                    value={valores[lead.id]?.comissao || ''}
                    onChange={(e) => handleComissaoChange(lead.id, e.target.value)}
                    disabled={lead.insurerConfirmed}
                    maxLength={4}
                    style={inputWithPrefixStyle}
                  />
                </div>

                <select
                  value={valores[lead.id]?.parcelamento || ''}
                  onChange={(e) => handleParcelamentoChange(lead.id, e.target.value)}
                  disabled={lead.insurerConfirmed}
                  style={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: '100%',
                    marginBottom: '8px',
                  }}
                >
                  <option value="">Parcelamento</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={`${i + 1}x`}>{i + 1}x</option>
                  ))}
                </select>

                {!lead.insurerConfirmed ? (
                  <button
                    onClick={() => onConfirmInsurer(lead.id)}
                    disabled={isButtonDisabled}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isButtonDisabled ? '#999' : '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isButtonDisabled ? 'default' : 'pointer',
                      width: '100%',
                    }}
                  >
                    Confirmar Seguradora
                  </button>
                ) : (
                  <span style={{ marginTop: '8px', color: 'green', fontWeight: 'bold' }}>
                    Status confirmado
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default LeadsFechados;
