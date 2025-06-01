const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.all('/proxy-gas', async (req, res) => {
  try {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwgeZteouyVWzrCvgHHQttx-5Bekgs_k-5EguO9Sn2p-XFrivFg9S7_gGKLdoDfCa08/exec';

    let url = GAS_URL;
    if (req.method === 'GET' && Object.keys(req.query).length > 0) {
      const params = new URLSearchParams(req.query);
      url += '?' + params.toString();
    }

    const options = {
      method: req.method,
      headers: { ...req.headers },
    };

    if (req.method === 'POST') {
      options.body = JSON.stringify(req.body);
      options.headers['Content-Type'] = 'application/json';
    }

    delete options.headers.host;
    delete options.headers['content-length'];

    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    const body = await response.text();

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', contentType);
    res.status(response.status).send(body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy rodando na porta ${PORT}`);
});
