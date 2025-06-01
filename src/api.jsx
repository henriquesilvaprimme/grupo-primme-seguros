const GOOGLE_SHEETS_SCRIPT_URL = 'COLE_AQUI_A_URL_DO_SEU_APPS_SCRIPT';

async function chamarScript(tipo, payload) {
  try {
    const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, payload }),
    });
    const data = await response.json();
    if (data.status !== 'sucesso') throw new Error(data.mensagem || 'Erro desconhecido');
    return data;
  } catch (error) {
    console.error('Erro na chamada ao Apps Script:', error);
    throw error;
  }
}

export { chamarScript };
