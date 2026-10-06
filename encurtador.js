// encurtador.js - Banco de dados SQLite e os 4 métodos solicitados
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');

// Inicializa a conexão com o banco de dados SQLite local (urls.db)
const db = new DatabaseSync(path.join(__dirname, 'urls.db'));

// Cria a tabela de URLs se ainda não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_original TEXT NOT NULL,
    codigo TEXT UNIQUE NOT NULL,
    url_encurtada TEXT NOT NULL,
    data_criacao TEXT NOT NULL,
    cliques INTEGER DEFAULT 0,
    criado_em TEXT NOT NULL
  )
`);

// Função auxiliar: gera um código aleatório de 6 caracteres
function gerarCodigo() {
  return crypto.randomBytes(3).toString('hex');
}

// Função auxiliar: obtém a data atual no formato AAAA-MM-DD
function obterDataHoje() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

const Encurtador = {
  // 1. MÉTODO: Encurtar uma URL e persistir no banco de dados
  encurtarUrl(urlOriginal, baseUrl = 'http://localhost:3000') {
    let url = urlOriginal.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const codigo = gerarCodigo();
    const urlEncurtada = `${baseUrl}/${codigo}`;
    const dataCriacao = obterDataHoje();
    const criadoEm = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO urls (url_original, codigo, url_encurtada, data_criacao, cliques, criado_em)
      VALUES (?, ?, ?, ?, 0, ?)
    `);
    const resultado = insert.run(url, codigo, urlEncurtada, dataCriacao, criadoEm);

    return this.buscarPorId(Number(resultado.lastInsertRowid));
  },

  // 2. MÉTODO: Retorna uma URL encurtada conforme um ID
  buscarPorId(id) {
    const numId = Number(id);
    if (!numId || isNaN(numId)) return null;

    const query = db.prepare('SELECT * FROM urls WHERE id = ?');
    return query.get(numId) || null;
  },

  // 3. MÉTODO: Retorna todas as URLs encurtadas em uma data específica
  buscarPorData(data) {
    if (!data) return [];
    let dataFormatada = String(data).trim();

    // Aceita formato brasileiro DD/MM/AAAA e converte para AAAA-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataFormatada)) {
      const [dia, mes, ano] = dataFormatada.split('/');
      dataFormatada = `${ano}-${mes}-${dia}`;
    }

    const query = db.prepare('SELECT * FROM urls WHERE data_criacao = ? ORDER BY id DESC');
    return query.all(dataFormatada);
  },

  // 4. MÉTODO: Retorna uma URL encurtada conforme o encurtamento (código ou link completo)
  buscarPorEncurtamento(termo) {
    if (!termo) return null;
    let termoLimpo = String(termo).trim().replace(/\/$/, '');
    
    // Extrai o código caso o usuário passe a URL completa (ex: http://localhost:3000/a1b2c3)
    const partes = termoLimpo.split('/');
    const codigo = partes[partes.length - 1];

    const query = db.prepare(`
      SELECT * FROM urls 
      WHERE codigo = ? 
         OR url_encurtada = ? 
         OR url_encurtada LIKE ?
    `);
    return query.get(codigo, termoLimpo, `%/${codigo}`) || null;
  },

  // Incrementa a quantidade de cliques ao acessar a URL encurtada
  registrarClique(codigo) {
    const query = db.prepare('UPDATE urls SET cliques = cliques + 1 WHERE codigo = ?');
    query.run(codigo);
  },

  // Retorna todas as URLs cadastradas
  listarTodas() {
    const query = db.prepare('SELECT * FROM urls ORDER BY id DESC');
    return query.all();
  }
};

module.exports = Encurtador;
