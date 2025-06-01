const BASE_URL = 'https://script.google.com/macros/s/AKfycbwgeZteouyVWzrCvgHHQttx-5Bekgs_k-5EguO9Sn2p-XFrivFg9S7_gGKLdoDfCa08/exec';

export async function buscarLeads() {
  const res = await fetch(`${BASE_URL}?action=getLeads`);
  const data = await res.json();
  return data;
}

export async function fecharLead(leadId) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'fecharLead',
      payload: { leadId },
    }),
  });
  return await res.json();
}

export async function perderLead(leadId) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'perderLead',
      payload: { leadId },
    }),
  });
  return await res.json();
}

export async function editarLead(payload) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'editarLead',
      payload,
    }),
  });
  return await res.json();
}

export async function criarUsuario(payload) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'criarUsuario',
      payload,
    }),
  });
  return await res.json();
}

export async function editarUsuario(payload) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'editarUsuario',
      payload,
    }),
  });
  return await res.json();
}
