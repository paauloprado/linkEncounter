#  Encurtador de URLs

Um projeto simples, didático e prático de um **Encurtador de URLs** desenvolvido em **Node.js** com persistência em banco de dados **SQLite**.

---

##  Sobre o Projeto

Os encurtadores de URL transformam links longos em URLs curtas e amigáveis para compartilhamento. Ao acessar a URL encurtada, o usuário é automaticamente redirecionado para o endereço original.

Este projeto atende pontualmente a todos os 4 requisitos solicitados no enunciado:

1. **Método de encurtar uma URL** persistindo-a no banco de dados SQLite (`encurtador.encurtarUrl`).
2. **Método que retorna uma URL encurtada conforme um ID** (`encurtador.buscarPorId`).
3. **Método que retorna todas as URLs encurtadas em uma data específica** (`encurtador.buscarPorData`).
4. **Método que retorna uma URL encurtada conforme o seu encurtamento** (`encurtador.buscarPorEncurtamento`).

---

##  Estrutura de Arquivos

```text
url_encurtador/
├── banco.js            # Conexão e criação da tabela no SQLite
├── encurtador.js       # Os 4 métodos principais com comentários explicativos simples
├── teste.js            # Script para testar os 4 métodos direto no terminal
├── server.js           # Servidor Express com API e redirecionamento de links
├── public/             # Interface visual moderna para testar no navegador
│   ├── index.html      # Página principal com formulários e tabelas
│   ├── style.css       # Estilização visual limpa e moderna
│   └── app.js          # Consumo das rotas no frontend
├── package.json        # Dependências e scripts de execução
├── .gitignore          # Arquivos ignorados pelo Git (ex: node_modules)
└── README.md           # Documentação completa do projeto
```

---

## 🛠️ Tecnologias Utilizadas

- **Node.js** (Ambiente de execução JavaScript)
- **SQLite** (Banco de dados relacional via `node:sqlite`)
- **Express** (Servidor HTTP para rotas de API e redirecionamentos)
- **HTML5, CSS3 e JavaScript Vanilla** (Interface web intuitiva)

---

##  Como Executar o Projeto Localmente

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** instalado em seu computador.

### 2. Instalar dependências
No terminal da pasta do projeto, execute:
```bash
npm install
```

### 3. Executar o Teste Demonstrativo dos 4 Métodos
Para verificar os 4 métodos funcionando e exibindo dados no console:
```bash
npm test
```
*(ou `node teste.js`)*

### 4. Iniciar o Servidor Web com Interface
Para iniciar o servidor e usar a interface interativa:
```bash
npm start
```
Abra o navegador em: **`http://localhost:3000`**

---

## 🔍 Demonstração dos Métodos (`encurtador.js`)

### 1. Encurtar URL e salvar no banco
```javascript
const encurtador = require('./encurtador');

const novaUrl = encurtador.encurtarUrl('https://github.com');
console.log(novaUrl);
// Retorna o registro criado com id, url_original, codigo, url_encurtada e data_criacao
```

### 2. Retornar URL encurtada por ID
```javascript
const url = encurtador.buscarPorId(1);
console.log(url);
```

### 3. Retornar URLs por data específica
```javascript
const urlsDoDia = encurtador.buscarPorData('2026-10-05');
console.log(urlsDoDia);
```

### 4. Retornar URL por encurtamento (código ou link completo)
```javascript
// Busca passando apenas o código curto
const porCodigo = encurtador.buscarPorEncurtamento('f7fe82');

// Ou passando a URL encurtada completa
const porLink = encurtador.buscarPorEncurtamento('http://localhost:3000/f7fe82');
```

---

## 🚀 Passo a Passo para Entregar no GitHub

Siga este guia simples para enviar seu projeto ao seu repositório no GitHub:

### Passo 1: Crie o repositório no GitHub
1. Acesse sua conta no [GitHub](https://github.com).
2. Clique no botão verde **"New"** (ou **"Novo repositório"**).
3. Dê o nome de `url_encurtador` (ou o nome que preferir).
4. Deixe como **Public** e **não marque** a opção de criar README (já temos um pronto).
5. Clique em **"Create repository"**.

### Passo 2: Executar os comandos no terminal do projeto
Abra o terminal na pasta deste projeto e rode os comandos abaixo (substitua `SEU_USUARIO` e `SEU_REPOSITORIO` pelo seu link do GitHub):

```bash
# 1. Inicializa o Git no projeto
git init

# 2. Adiciona todos os arquivos
git add .

# 3. Faz o primeiro commit
git commit -m "feat: projeto encurtador de URLs com os 4 métodos e sqlite"

# 4. Define a branch principal como main
git branch -M main

# 5. Conecta seu repositório local ao seu GitHub
git remote add origin https://github.com/paauloprado/linkEncounter.git

# 6. Envia os arquivos para o GitHub
git push -u origin main
```

Pronto! Seu projeto estará publicado no GitHub com todos os arquivos, documentação e testes prontos para avaliação.
