// app.js - Funciona tanto localmente (Node.js/SQLite) quanto no GitHub Pages (Navegador)

const isGitHubPages = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';

// Armazenamento local para compatibilidade com o GitHub Pages
const storage = {
  getUrls() {
    try {
      return JSON.parse(localStorage.getItem('linkEncounter_urls')) || [];
    } catch {
      return [];
    }
  },
  saveUrls(urls) {
    localStorage.setItem('linkEncounter_urls', JSON.stringify(urls));
  },
  // 1. Método: Encurtar URL no navegador
  encurtar(urlOriginal) {
    let url = urlOriginal.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const codigo = Math.random().toString(36).substring(2, 8);
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/index\.html$/, '');
    const urlEncurtada = `${baseUrl.replace(/\/$/, '')}/?c=${codigo}`;
    const dataCriacao = new Date().toISOString().split('T')[0];

    const urls = this.getUrls();
    const novoRegistro = {
      id: urls.length + 1,
      url_original: url,
      codigo: codigo,
      url_encurtada: urlEncurtada,
      data_criacao: dataCriacao,
      cliques: 0
    };

    urls.unshift(novoRegistro);
    this.saveUrls(urls);
    return novoRegistro;
  },
  // 2. Método: Buscar por ID
  buscarPorId(id) {
    const urls = this.getUrls();
    return urls.find(u => Number(u.id) === Number(id)) || null;
  },
  // 3. Método: Buscar por Data
  buscarPorData(data) {
    const urls = this.getUrls();
    return urls.filter(u => u.data_criacao === data);
  },
  // 4. Método: Buscar por Encurtamento (código ou link)
  buscarPorEncurtamento(termo) {
    const termoLimpo = termo.trim().replace(/\/$/, '');
    const partes = termoLimpo.split(/[\/?=]/);
    const codigo = partes[partes.length - 1];
    const urls = this.getUrls();
    return urls.find(u => u.codigo === codigo || u.url_encurtada === termoLimpo || u.codigo === termoLimpo) || null;
  },
  // Registrar clique
  registrarClique(codigo) {
    const urls = this.getUrls();
    const item = urls.find(u => u.codigo === codigo);
    if (item) {
      item.cliques = (item.cliques || 0) + 1;
      this.saveUrls(urls);
    }
  }
};

// Redirecionamento automático no GitHub Pages (se o link contiver ?c=codigo)
(function verificarRedirecionamentoGitHubPages() {
  const params = new URLSearchParams(window.location.search);
  const codigo = params.get('c');
  if (codigo) {
    const registro = storage.buscarPorEncurtamento(codigo);
    if (registro) {
      storage.registrarClique(codigo);
      window.location.href = registro.url_original;
    }
  }
})();

// Elementos da página
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

function mostrarToast(texto = 'Copiado!') {
  if (!toast) return;
  toast.textContent = texto;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}

const hoje = new Date().toISOString().split('T')[0];
if (inputBuscaData) {
  inputBuscaData.value = hoje;
}

// 1. Encurtar URL
formEncurtar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = inputUrl.value.trim();
  if (!url) return;

  try {
    let dados;
    if (isGitHubPages) {
      dados = storage.encurtar(url);
    } else {
      const res = await fetch('/api/encurtar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      dados = await res.json();
      if (!res.ok) throw new Error(dados.erro);
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
    alert(err.message || 'Erro ao encurtar URL.');
  }
});

btnCopiar.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(linkCurto.textContent);
    mostrarToast('Link copiado!');
  } catch (err) {
    console.error(err);
  }
});

// Abas de navegação
tabItems.forEach(tab => {
  tab.addEventListener('click', () => {
    tabItems.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const painel = document.getElementById(tab.dataset.tab);
    if (painel) painel.classList.add('active');
  });
});

// 2. Consulta por ID
formBuscaId.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = inputBuscaId.value.trim();
  if (!id) return;

  try {
    let dados;
    if (isGitHubPages) {
      dados = storage.buscarPorId(id);
      if (!dados) throw new Error('URL não encontrada.');
    } else {
      const res = await fetch(`/api/urls/${id}`);
      dados = await res.json();
      if (!res.ok) throw new Error(dados.erro || 'URL não encontrada.');
    }

    resultadoBuscaId.classList.remove('hidden');
    resultadoBuscaId.className = 'box-resultado';
    resultadoBuscaId.innerHTML = `
      <p><strong>ID:</strong> #${dados.id}</p>
      <p><strong>Encurtamento:</strong> <a href="${dados.url_encurtada}" target="_blank">${dados.url_encurtada}</a></p>
      <p><strong>Destino:</strong> ${dados.url_original}</p>
      <p><strong>Data:</strong> ${dados.data_criacao} • <strong>Cliques:</strong> ${dados.cliques}</p>
    `;
  } catch (err) {
    resultadoBuscaId.classList.remove('hidden');
    resultadoBuscaId.className = 'box-resultado erro';
    resultadoBuscaId.textContent = err.message || 'Erro ao consultar ID.';
  }
});

// 3. Consulta por Data
formBuscaData.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = inputBuscaData.value.trim();
  if (!data) return;

  try {
    let lista;
    if (isGitHubPages) {
      lista = storage.buscarPorData(data);
    } else {
      const res = await fetch(`/api/urls/data/${data}`);
      lista = await res.json();
    }

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
    resultadoBuscaData.classList.remove('hidden');
    resultadoBuscaData.className = 'box-resultado erro';
    resultadoBuscaData.textContent = 'Erro ao buscar por data.';
  }
});

// 4. Consulta por Código ou Encurtamento
formBuscaCodigo.addEventListener('submit', async (e) => {
  e.preventDefault();
  const termoBruto = inputBuscaCodigo.value.trim().replace(/\/$/, '');
  if (!termoBruto) return;

  try {
    let dados;
    if (isGitHubPages) {
      dados = storage.buscarPorEncurtamento(termoBruto);
      if (!dados) throw new Error('Encurtamento não encontrado.');
    } else {
      const partes = termoBruto.split(/[\/?=]/);
      const codigo = partes[partes.length - 1];

      let res = await fetch(`/api/urls/codigo/${encodeURIComponent(codigo)}`);
      if (!res.ok) {
        res = await fetch(`/api/buscar-codigo?termo=${encodeURIComponent(termoBruto)}`);
      }
      dados = await res.json();
      if (!res.ok) throw new Error(dados.erro || 'Encurtamento não encontrado.');
    }

    resultadoBuscaCodigo.classList.remove('hidden');
    resultadoBuscaCodigo.className = 'box-resultado';
    resultadoBuscaCodigo.innerHTML = `
      <p><strong>Código:</strong> <code>${dados.codigo}</code> (ID: #${dados.id})</p>
      <p><strong>Encurtamento:</strong> <a href="${dados.url_encurtada}" target="_blank">${dados.url_encurtada}</a></p>
      <p><strong>Destino:</strong> ${dados.url_original}</p>
      <p><strong>Data:</strong> ${dados.data_criacao} • <strong>Cliques:</strong> ${dados.cliques}</p>
    `;
  } catch (err) {
    resultadoBuscaCodigo.classList.remove('hidden');
    resultadoBuscaCodigo.className = 'box-resultado erro';
    resultadoBuscaCodigo.textContent = err.message || 'Encurtamento não encontrado.';
  }
});

// Tabela de URLs
async function carregarUrls() {
  try {
    let lista;
    if (isGitHubPages) {
      lista = storage.getUrls();
    } else {
      const res = await fetch('/api/urls');
      lista = await res.json();
    }

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
        <td>${item.cliques || 0}</td>
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
