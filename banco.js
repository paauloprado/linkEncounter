// banco.js - Configuração simples do banco de dados SQLite
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

// Cria ou abre o arquivo de banco de dados 'urls.db'
const dbPath = path.join(__dirname, 'urls.db');
const db = new DatabaseSync(dbPath);

// Criação da tabela de URLs caso ela ainda não exista
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

module.exports = db;
