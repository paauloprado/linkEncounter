# linkEncounter

Um encurtador de links simples feito em Node.js com banco de dados SQLite.

## O que o projeto faz

Ele resolve os 4 requisitos da atividade:
1. **Encurtar URL**: recebe um link longo, gera um código curto e salva no banco de dados.
2. **Buscar por ID**: encontra o link cadastrado usando o ID.
3. **Buscar por data**: lista todos os links criados em uma data específica.
4. **Buscar por encurtamento**: encontra o link usando o código ou a URL encurtada.

Ao acessar a URL encurtada no navegador, você é redirecionado automaticamente para o link original.

---

## Como rodar o projeto

Você só precisa ter o **Node.js** instalado no computador.

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor:
```bash
npm start
```

3. Abra no navegador:
```text
http://localhost:3000
```

Na página você pode encurtar links, testar as consultas e ver todos os registros salvos.

---

## Estrutura do projeto

- `encurtador.js`: regras de negócio, banco SQLite e os 4 métodos com comentários simples.
- `server.js`: servidor web, rotas da API e redirecionamento.
- `public/`: interface web simples (HTML, CSS e JavaScript).

