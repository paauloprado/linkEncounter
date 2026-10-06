// server.js - Servidor web e rotas da API
const express = require('express');
const path = require('node:path');
const encurtador = require('./encurtador');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// ROTA 1: Encurtar URL (POST /api/encurtar)
app.post('/api/encurtar', (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return res.status(400).json({ erro: 'Informe uma URL válida.' });
  }

  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const resultado = encurtador.encurtarUrl(url, baseUrl);
    return res.status(201).json(resultado);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao encurtar: ' + err.message });
  }
});

// ROTA 2: Retornar URL encurtada por ID (GET /api/urls/:id)
app.get('/api/urls/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  const registro = encurtador.buscarPorId(id);
  if (!registro) {
    return res.status(404).json({ erro: 'Nenhuma URL encontrada para o ID informado.' });
  }

  return res.json(registro);
});

// ROTA 3: Retornar URLs por data específica (GET /api/urls/data/:data)
app.get('/api/urls/data/:data', (req, res) => {
  const data = req.params.data;
  const registros = encurtador.buscarPorData(data);
  return res.json(registros);
});

// ROTA 4: Retornar URL por encurtamento/código (aceita query param ou rota)
app.get('/api/buscar-codigo', (req, res) => {
  const termo = req.query.termo || '';
  const registro = encurtador.buscarPorEncurtamento(termo);
  if (!registro) {
    return res.status(404).json({ erro: 'URL encurtada não encontrada.' });
  }
  return res.json(registro);
});

// Rota alternativa com parâmetro de caminho
app.get('/api/urls/codigo/:codigo', (req, res) => {
  const termo = req.params.codigo;
  const registro = encurtador.buscarPorEncurtamento(termo);
  if (!registro) {
    return res.status(404).json({ erro: 'URL encurtada não encontrada.' });
  }
  return res.json(registro);
});

// Rota auxiliar: Listar todas as URLs
app.get('/api/urls', (req, res) => {
  const registros = encurtador.listarTodas();
  return res.json(registros);
});

// ROTA DE REDIRECIONAMENTO: Ao clicar na URL encurtada (ex: localhost:3000/a1b2c3)
app.get('/:codigo', (req, res, next) => {
  const { codigo } = req.params;

  if (codigo.includes('.') || codigo === 'favicon.ico' || codigo === 'api') {
    return next();
  }

  const registro = encurtador.buscarPorEncurtamento(codigo);
  if (registro) {
    encurtador.registrarClique(codigo);
    return res.redirect(registro.url_original);
  }

  return res.status(404).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 40px;">
      <h2>Link não encontrado</h2>
      <p>O link informado não existe ou foi removido.</p>
      <a href="/" style="color: #2563eb;">Voltar para o início</a>
    </div>
  `);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
