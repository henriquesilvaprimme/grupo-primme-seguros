const GAS_URL = 'https://script.google.com/macros/s/SEU_DEPLOY_URL/exec';

export async function criarUsuario(dados) {
  const response = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'criarUsuario',
      payload: dados
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function criarLead(dados) {
  return await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'criarLead',
      payload: dados
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json());
}

export async function fecharLead(leadId) {
  return await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'fecharLead',
      payload: { leadId }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json());
}

export async function perderLead(leadId) {
  return await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'perderLead',
      payload: { leadId }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json());
}

export async function editarUsuario(dados) {
  return await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'editarUsuario',
      payload: dados
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json());
}
