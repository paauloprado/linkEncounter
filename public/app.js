// app.js - Lógica simples e funcional de interface

// Elementos
const formEncurtar = document.getElementById('form-encurtar');
const inputUrl = document.getElementById('input-url');
const resultadoEncurtada = document.getElementById('resultado-encurtada');
const linkCurto = document.getElementById('link-curto');
const btnCopiar = document.getElementById('btn-copiar');
const infoOriginal = document.getElementById('info-original');
const infoData = document.getElementById('info-data');
const badgeId = document.getElementById('badge-id');

const tabItems = document.querySelectorAll('.tab-item');
const tabPanes = document.querySelectorAll('.tab-pane');

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
const toast = document.getElementById('toast');

// Mostra o toast breve
function mostrarToast(texto = 'Copiado!') {
  if (!toast) return;
  toast.textContent = texto;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}

// Data atual no filtro
const hoje = new Date().toISOString().split('T')[0];
if (inputBuscaData) {
  inputBuscaData.value = hoje;
}

// 1. Encurtar URL (Método 1)
formEncurtar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = inputUrl.value.trim();
  if (!url) return;

  try {
    const res = await fetch('/api/encurtar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const dados = await res.json();

    if (!res.ok) {
      alert(dados.erro || 'Erro ao encurtar');
      return;
    }

    linkCurto.href = dados.url_encurtada;
    linkCurto.textContent = dados.url_encurtada;
    infoOriginal.textContent = dados.url_original;
    infoData.textContent = dados.data_criacao;
    badgeId.textContent = `ID #${dados.id}`;

    resultadoEncurtada.classList.remove('hidden');
    inputUrl.value = '';

    carregarUrls();
  } catch (err) {
    alert('Erro de conexão ao encurtar URL.');
  }
});

// Copiar link encurtado
btnCopiar.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(linkCurto.textContent);
    mostrarToast('Link copiado!');
  } catch (err) {
    console.error(err);
  }
});

// Navegação entre abas de consulta
tabItems.forEach(tab => {
  tab.addEventListener('click', () => {
    tabItems.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const painel = document.getElementById(tab.dataset.tab);
    if (painel) painel.classList.add('active');
  });
});

// 2. Consulta por ID (Método 2)
formBuscaId.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = inputBuscaId.value.trim();
  if (!id) return;

  try {
    const res = await fetch(`/api/urls/${id}`);
    const dados = await res.json();

    resultadoBuscaId.classList.remove('hidden');

    if (!res.ok) {
      resultadoBuscaId.className = 'box-resultado erro';
      resultadoBuscaId.textContent = dados.erro || 'URL não encontrada.';
      return;
    }

    resultadoBuscaId.className = 'box-resultado';
    resultadoBuscaId.innerHTML = `
      <p><strong>ID:</strong> #${dados.id}</p>
      <p><strong>Encurtamento:</strong> <a href="${dados.url_encurtada}" target="_blank">${dados.url_encurtada}</a></p>
      <p><strong>Destino:</strong> ${dados.url_original}</p>
      <p><strong>Data:</strong> ${dados.data_criacao} • <strong>Cliques:</strong> ${dados.cliques}</p>
    `;
  } catch (err) {
    resultadoBuscaId.className = 'box-resultado erro';
    resultadoBuscaId.textContent = 'Erro ao consultar ID.';
  }
});

// 3. Consulta por Data (Método 3)
formBuscaData.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = inputBuscaData.value.trim();
  if (!data) return;

  try {
    const res = await fetch(`/api/urls/data/${data}`);
    const lista = await res.json();

    resultadoBuscaData.classList.remove('hidden');
    resultadoBuscaData.className = 'box-resultado';

    if (!lista || lista.length === 0) {
      resultadoBuscaData.innerHTML = `<p>Nenhuma URL cadastrada na data <strong>${data}</strong>.</p>`;
      return;
    }

    let itens = lista.map(item => `
      <li style="margin-bottom: 4px;">
        <a href="${item.url_encurtada}" target="_blank">${item.url_encurtada}</a>
        — ${item.url_original} (ID: #${item.id}, ${item.cliques} cliques)
      </li>
    `).join('');

    resultadoBuscaData.innerHTML = `
      <p style="margin-bottom: 8px;"><strong>${lista.length}</strong> URL(s) encontrada(s):</p>
      <ul style="padding-left: 20px;">${itens}</ul>
    `;
  } catch (err) {
    resultadoBuscaData.className = 'box-resultado erro';
    resultadoBuscaData.textContent = 'Erro ao buscar por data.';
  }
});

// 4. Consulta por Código ou Encurtamento (Método 4)
formBuscaCodigo.addEventListener('submit', async (e) => {
  e.preventDefault();
  const termoBruto = inputBuscaCodigo.value.trim().replace(/\/$/, '');
  if (!termoBruto) return;

  // Extrai o código mesmo se o usuário colou a URL completa (ex: http://localhost:3000/732587)
  const partes = termoBruto.split('/');
  const codigo = partes[partes.length - 1];

  try {
    // Tenta primeiro a rota por código
    let res = await fetch(`/api/urls/codigo/${encodeURIComponent(codigo)}`);
    
    // Se não encontrou pela rota por código, tenta por termo de busca
    if (!res.ok) {
      res = await fetch(`/api/buscar-codigo?termo=${encodeURIComponent(termoBruto)}`);
    }

    const dados = await res.json();
    resultadoBuscaCodigo.classList.remove('hidden');

    if (!res.ok) {
      resultadoBuscaCodigo.className = 'box-resultado erro';
      resultadoBuscaCodigo.textContent = dados.erro || 'Encurtamento não encontrado.';
      return;
    }

    resultadoBuscaCodigo.className = 'box-resultado';
    resultadoBuscaCodigo.innerHTML = `
      <p><strong>Código:</strong> <code>${dados.codigo}</code> (ID: #${dados.id})</p>
      <p><strong>Encurtamento:</strong> <a href="${dados.url_encurtada}" target="_blank">${dados.url_encurtada}</a></p>
      <p><strong>Destino:</strong> ${dados.url_original}</p>
      <p><strong>Data:</strong> ${dados.data_criacao} • <strong>Cliques:</strong> ${dados.cliques}</p>
    `;
  } catch (err) {
    resultadoBuscaCodigo.className = 'box-resultado erro';
    resultadoBuscaCodigo.textContent = 'Encurtamento não encontrado.';
  }
});

// Tabela de URLs
async function carregarUrls() {
  try {
    const res = await fetch('/api/urls');
    const lista = await res.json();

    if (!lista || lista.length === 0) {
      tabelaCorpo.innerHTML = `
        <tr>
          <td colspan="6" class="texto-vazio">Nenhuma URL cadastrada ainda.</td>
        </tr>
      `;
      return;
    }

    tabelaCorpo.innerHTML = lista.map(item => `
      <tr>
        <td>#${item.id}</td>
        <td>
          <a href="${item.url_encurtada}" target="_blank" class="url-curta-link">
            ${item.codigo}
          </a>
        </td>
        <td>
          <span class="url-texto" title="${item.url_original}">${item.url_original}</span>
        </td>
        <td>${item.data_criacao}</td>
        <td>${item.cliques}</td>
        <td>
          <a href="${item.url_encurtada}" target="_blank" class="btn btn-secundario" style="padding: 3px 8px; font-size: 0.8rem;">
            Acessar
          </a>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Erro ao carregar URLs:', err);
  }
}

btnAtualizarLista.addEventListener('click', carregarUrls);
carregarUrls();
