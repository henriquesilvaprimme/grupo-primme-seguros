import React, { useEffect, useState } from 'react';
import LeadsList from './components/LeadsList';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch('https://grupo-primme-seguros100.onrender.com/proxy-gas?tipo=nao_atribuido');
        const data = await response.json();
        setLeads(data);
      } catch (error) {
        console.error('Erro ao buscar os leads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Leads não atribuídos</h1>
      {loading ? <p>Carregando...</p> : <LeadsList leads={leads} />}
    </div>
  );
}
