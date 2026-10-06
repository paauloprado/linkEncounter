// encurtador.js - Regras de negócio e métodos solicitados
const crypto = require('node:crypto');
const db = require('./banco');

// Gera um código aleatório simples de 6 caracteres (ex: 'a3f1b9')
function gerarCodigoUnico() {
  return crypto.randomBytes(3).toString('hex');
}

// Formata a data atual no padrão 'AAAA-MM-DD' (ex: '2026-10-05')
function obterDataAtual() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

const EncurtadorService = {
  // 1. Método para encurtar uma URL e persistir no banco de dados
  encurtarUrl(urlOriginal, baseUrl = 'http://localhost:3000') {
    // Garante que a URL comece com http:// ou https://
    let urlFormatada = urlOriginal.trim();
    if (!urlFormatada.startsWith('http://') && !urlFormatada.startsWith('https://')) {
      urlFormatada = 'https://' + urlFormatada;
    }

    const codigo = gerarCodigoUnico();
    const urlEncurtada = `${baseUrl}/${codigo}`;
    const dataCriacao = obterDataAtual();
    const criadoEm = new Date().toISOString();

    // Insere os dados no banco SQLite
    const query = db.prepare(`
      INSERT INTO urls (url_original, codigo, url_encurtada, data_criacao, cliques, criado_em)
      VALUES (?, ?, ?, ?, 0, ?)
    `);
    const resultado = query.run(urlFormatada, codigo, urlEncurtada, dataCriacao, criadoEm);

    // Retorna o registro recém-criado usando o id gerado
    return this.buscarPorId(Number(resultado.lastInsertRowid));
  },

  // 2. Método que retorna uma URL encurtada conforme um ID
  buscarPorId(id) {
    const query = db.prepare('SELECT * FROM urls WHERE id = ?');
    const registro = query.get(id);
    return registro || null;
  },

  // 3. Método que retorna todas as URLs encurtadas em uma data específica (ex: '2026-10-05')
  buscarPorData(data) {
    const query = db.prepare('SELECT * FROM urls WHERE data_criacao = ? ORDER BY id DESC');
    const registros = query.all(data);
    return registros;
  },

  // 4. Método que retorna uma URL encurtada conforme o encurtamento (código ou URL completa)
  buscarPorEncurtamento(termo) {
    // Se o usuário passou uma URL completa (ex: http://localhost:3000/a3f1b9), extrai o código final
    const termoLimpo = termo.trim();
    const partes = termoLimpo.split('/');
    const codigoOuTexto = partes[partes.length - 1];

    // Busca tanto pelo código quanto pela URL encurtada completa
    const query = db.prepare(`
      SELECT * FROM urls 
      WHERE codigo = ? OR url_encurtada = ?
    `);
    const registro = query.get(codigoOuTexto, termoLimpo);
    return registro || null;
  },

  // Método auxiliar: incrementa o contador de cliques ao acessar o link
  registrarClique(codigo) {
    const query = db.prepare('UPDATE urls SET cliques = cliques + 1 WHERE codigo = ?');
    query.run(codigo);
  },

  // Método auxiliar: lista todas as URLs cadastradas
  listarTodas() {
    const query = db.prepare('SELECT * FROM urls ORDER BY id DESC');
    return query.all();
  }
};

module.exports = EncurtadorService;
