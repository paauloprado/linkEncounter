// app.js - Lógica interativa do frontend com explicações simples

// Elementos da interface
const formEncurtar = document.getElementById('form-encurtar');
const inputUrl = document.getElementById('input-url');
const resultadoEncurtada = document.getElementById('resultado-encurtada');
const linkCurto = document.getElementById('link-curto');
const btnCopiar = document.getElementById('btn-copiar');
const infoOriginal = document.getElementById('info-original');
const infoData = document.getElementById('info-data');
const badgeId = document.getElementById('badge-id');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

const formBuscaId = document.getElementById('form-busca-id');
const inputBuscaId = document.getElementById('input-busca-id');
const resultadoBuscaId = document.getElementById('resultado-busca-id');

const formBuscaData = document.getElementById('form-busca-data');
const inputBuscaData = document.getElementById('input-busca-data');
const resultadoBuscaData = document.getElementById('resultado-busca-data');

const formBuscaCodigo = document.getElementById('form-busca-codigo');
const inputBuscaCodigo = document.getElementById('input-busca-codigo');
const resultadoBuscaCodigo = document.getElementById('resultado-busca-codigo');

const tabelaCorpo = document.getElementById('tabela-corpo');
const btnAtualizarLista = document.getElementById('btn-atualizar-lista');

// Define a data atual por padrão no campo de busca por data
const hoje = new Date().toISOString().split('T')[0];
if (inputBuscaData) {
  inputBuscaData.value = hoje;
}

// ---------------------------------------------------------------------
// 1. AÇÃO: Encurtar URL (Consome o método 1 via POST /api/encurtar)
// ---------------------------------------------------------------------
formEncurtar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = inputUrl.value.trim();

  try {
    const resposta = await fetch('/api/encurtar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || 'Falha ao encurtar URL.');
      return;
    }

    // Exibe o link encurtado na tela
    linkCurto.href = dados.url_encurtada;
    linkCurto.textContent = dados.url_encurtada;
    infoOriginal.textContent = dados.url_original;
    infoData.textContent = dados.data_criacao;
    badgeId.textContent = `ID: #${dados.id}`;

    resultadoEncurtada.classList.remove('hidden');
    inputUrl.value = '';

    // Atualiza a tabela de links automaticamente
    carregarTodasUrls();
  } catch (erro) {
    console.error('Erro:', erro);
    alert('Erro de conexão com o servidor.');
  }
});

// Botão para copiar o link encurtado para a área de transferência
btnCopiar.addEventListener('click', () => {
  navigator.clipboard.writeText(linkCurto.textContent).then(() => {
    const textoOriginal = btnCopiar.textContent;
    btnCopiar.textContent = 'Copiado!';
    setTimeout(() => {
      btnCopiar.textContent = textoOriginal;
    }, 2000);
  });
});

// ---------------------------------------------------------------------
// CONTROLE DE ABAS (Navegação entre Métodos 2, 3 e 4)
// ---------------------------------------------------------------------
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const tabAlvo = document.getElementById(btn.dataset.tab);
    if (tabAlvo) {
      tabAlvo.classList.add('active');
    }
  });
});

// ---------------------------------------------------------------------
// 2. AÇÃO: Buscar por ID (Consome o método 2 via GET /api/urls/:id)
// ---------------------------------------------------------------------
formBuscaId.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = inputBuscaId.value;

  try {
    const resposta = await fetch(`/api/urls/${id}`);
    const dados = await resposta.json();

    resultadoBuscaId.classList.remove('hidden');

    if (!resposta.ok) {
      resultadoBuscaId.className = 'consulta-resultado erro';
      resultadoBuscaId.innerHTML = `<strong>Erro:</strong> ${dados.erro}`;
      return;
    }

    resultadoBuscaId.className = 'consulta-resultado sucesso';
    resultadoBuscaId.innerHTML = `
      <p><strong>ID:</strong> #${dados.id}</p>
      <p><strong>URL Encurtada:</strong> <a href="${dados.url_encurtada}" target="_blank" style="color: #38bdf8;">${dados.url_encurtada}</a></p>
      <p><strong>Destino Original:</strong> ${dados.url_original}</p>
      <p><strong>Data de Criação:</strong> ${dados.data_criacao}</p>
      <p><strong>Total de Cliques:</strong> ${dados.cliques}</p>
    `;
  } catch (erro) {
    console.error(erro);
    resultadoBuscaId.className = 'consulta-resultado erro';
    resultadoBuscaId.textContent = 'Erro ao realizar busca.';
  }
});

// ---------------------------------------------------------------------
// 3. AÇÃO: Buscar por Data (Consome o método 3 via GET /api/urls/data/:data)
// ---------------------------------------------------------------------
formBuscaData.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = inputBuscaData.value;

  try {
    const resposta = await fetch(`/api/urls/data/${data}`);
    const lista = await resposta.json();

    resultadoBuscaData.classList.remove('hidden');
    resultadoBuscaData.className = 'consulta-resultado sucesso';

    if (!lista || lista.length === 0) {
      resultadoBuscaData.innerHTML = `<p>Nenhuma URL foi cadastrada na data <strong>${data}</strong>.</p>`;
      return;
    }

    let html = `<p><strong>${lista.length}</strong> URL(s) encontrada(s) na data <strong>${data}</strong>:</p><ul style="margin-top: 8px; padding-left: 20px;">`;
    lista.forEach(item => {
      html += `
        <li style="margin-bottom: 6px;">
          <a href="${item.url_encurtada}" target="_blank" style="color: #38bdf8; font-weight: bold;">${item.url_encurtada}</a>
          → ${item.url_original} (ID: #${item.id}, Cliques: ${item.cliques})
        </li>
      `;
    });
    html += '</ul>';
    resultadoBuscaData.innerHTML = html;
  } catch (erro) {
    console.error(erro);
    resultadoBuscaData.className = 'consulta-resultado erro';
    resultadoBuscaData.textContent = 'Erro ao buscar URLs por data.';
  }
});

// ---------------------------------------------------------------------
// 4. AÇÃO: Buscar por Código (Consome o método 4 via GET /api/urls/codigo/:codigo)
// ---------------------------------------------------------------------
formBuscaCodigo.addEventListener('submit', async (e) => {
  e.preventDefault();
  const termo = encodeURIComponent(inputBuscaCodigo.value.trim());

  try {
    const resposta = await fetch(`/api/urls/codigo/${termo}`);
    const dados = await resposta.json();

    resultadoBuscaCodigo.classList.remove('hidden');

    if (!resposta.ok) {
      resultadoBuscaCodigo.className = 'consulta-resultado erro';
      resultadoBuscaCodigo.innerHTML = `<strong>Erro:</strong> ${dados.erro}`;
      return;
    }

    resultadoBuscaCodigo.className = 'consulta-resultado sucesso';
    resultadoBuscaCodigo.innerHTML = `
      <p><strong>Código Localizado:</strong> <code>${dados.codigo}</code> (ID: #${dados.id})</p>
      <p><strong>URL Encurtada:</strong> <a href="${dados.url_encurtada}" target="_blank" style="color: #38bdf8;">${dados.url_encurtada}</a></p>
      <p><strong>Destino Original:</strong> ${dados.url_original}</p>
      <p><strong>Data de Cadastro:</strong> ${dados.data_criacao}</p>
      <p><strong>Total de Cliques:</strong> ${dados.cliques}</p>
    `;
  } catch (erro) {
    console.error(erro);
    resultadoBuscaCodigo.className = 'consulta-resultado erro';
    resultadoBuscaCodigo.textContent = 'Erro ao buscar URL encurtada.';
  }
});

// ---------------------------------------------------------------------
// LISTAGEM GERAL: Carregar e renderizar tabela de URLs salvas
// ---------------------------------------------------------------------
async function carregarTodasUrls() {
  try {
    const resposta = await fetch('/api/urls');
    const lista = await resposta.json();

    if (!lista || lista.length === 0) {
      tabelaCorpo.innerHTML = `
        <tr>
          <td colspan="6" class="texto-centro">Nenhuma URL cadastrada ainda. Crie sua primeira URL acima!</td>
        </tr>
      `;
      return;
    }

    tabelaCorpo.innerHTML = lista.map(item => `
      <tr>
        <td>#${item.id}</td>
        <td>
          <a href="${item.url_encurtada}" target="_blank" style="color: #38bdf8; font-weight: 600;">
            ${item.codigo}
          </a>
        </td>
        <td>
          <span class="url-longa-truncada" title="${item.url_original}">
            ${item.url_original}
          </span>
        </td>
        <td>${item.data_criacao}</td>
        <td>
          <span class="badge-cliques">${item.cliques} cliques</span>
        </td>
        <td>
          <a href="${item.url_encurtada}" target="_blank" class="btn btn-small">
            Acessar ↗
          </a>
        </td>
      </tr>
    `).join('');
  } catch (erro) {
    console.error('Erro ao carregar lista de URLs:', erro);
  }
}

// Botão de atualizar lista manualmente
btnAtualizarLista.addEventListener('click', carregarTodasUrls);

// Carrega as URLs ao abrir a página
carregarTodasUrls();
