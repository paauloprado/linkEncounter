// server.js - Servidor web e rotas da API
const express = require('express');
const path = require('node:path');
const encurtador = require('./encurtador');

const app = express();
const PORT = process.env.PORT || 3000;

// Permite receber dados em formato JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos da pasta 'public' (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ROTA 1: Encurtar uma URL
app.post('/api/encurtar', (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return res.status(400).json({ erro: 'Por favor, informe uma URL válida.' });
  }

  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const resultado = encurtador.encurtarUrl(url, baseUrl);
    return res.status(201).json(resultado);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro ao encurtar URL: ' + erro.message });
  }
});

// ROTA 2: Retornar URL encurtada por ID
app.get('/api/urls/:id', (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ erro: 'ID inválido. Deve ser um número.' });
  }

  const registro = encurtador.buscarPorId(id);
  if (!registro) {
    return res.status(404).json({ erro: 'URL não encontrada para o ID informado.' });
  }

  return res.json(registro);
});

// ROTA 3: Retornar todas as URLs encurtadas em uma data específica (ex: 2026-10-05)
app.get('/api/urls/data/:data', (req, res) => {
  const data = req.params.data;
  const registros = encurtador.buscarPorData(data);
  return res.json(registros);
});

// ROTA 4: Retornar URL encurtada por código ou encurtamento
app.get('/api/urls/codigo/:codigo', (req, res) => {
  const termo = req.params.codigo;
  const registro = encurtador.buscarPorEncurtamento(termo);

  if (!registro) {
    return res.status(404).json({ erro: 'URL encurtada não encontrada.' });
  }

  return res.json(registro);
});

// Rota auxiliar: Listar todas as URLs cadastradas
app.get('/api/urls', (req, res) => {
  const registros = encurtador.listarTodas();
  return res.json(registros);
});

// ROTA PRINCIPAL DE REDIRECIONAMENTO: Acessar a URL encurtada (ex: localhost:3000/a3f1b9)
app.get('/:codigo', (req, res, next) => {
  const { codigo } = req.params;

  // Evita interceptar favicon ou rotas que não sejam códigos
  if (codigo === 'favicon.ico' || codigo === 'api') {
    return next();
  }

  const registro = encurtador.buscarPorEncurtamento(codigo);
  if (registro) {
    // Incrementa cliques e redireciona para a URL original
    encurtador.registrarClique(codigo);
    return res.redirect(registro.url_original);
  }

  // Se o código não existir, exibe página de link não encontrado
  res.status(404).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h2>Link não encontrado</h2>
      <p>O link encurtado <code>${codigo}</code> não existe ou expirou.</p>
      <a href="/" style="color: #4f46e5; text-decoration: none; font-weight: bold;">Voltar para o início</a>
    </div>
  `);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(` Servidor rodando em http://localhost:${PORT}`);
  console.log(` Testes rápidos podem ser vistos em http://localhost:${PORT}`);
});
