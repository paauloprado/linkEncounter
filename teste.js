// teste.js - Demonstração prática dos 4 métodos exigidos no projeto
const encurtador = require('./encurtador');

console.log('==================================================');
console.log('   TESTE DO PROJETO: ENCURTADOR DE URL');
console.log('==================================================\n');

// 1. Testando o método de encurtar URL e persistir no banco
console.log('1. ENCURTANDO UMA NOVA URL:');
const novaUrl1 = encurtador.encurtarUrl('https://github.com');
const novaUrl2 = encurtador.encurtarUrl('https://developer.mozilla.org');
console.log('URL 1 criada:', novaUrl1);
console.log('URL 2 criada:', novaUrl2);
console.log('--------------------------------------------------\n');

// 2. Testando o método de buscar URL conforme o ID
console.log(`2. BUSCANDO URL POR ID (${novaUrl1.id}):`);
const buscaPorId = encurtador.buscarPorId(novaUrl1.id);
console.log('Resultado encontrado por ID:', buscaPorId);
console.log('--------------------------------------------------\n');

// 3. Testando o método de buscar URLs por data específica
const dataHoje = novaUrl1.data_criacao;
console.log(`3. BUSCANDO TODAS AS URLs DA DATA (${dataHoje}):`);
const buscaPorData = encurtador.buscarPorData(dataHoje);
console.log(`Encontradas ${buscaPorData.length} URL(s) nesta data:`);
console.table(buscaPorData);
console.log('--------------------------------------------------\n');

// 4. Testando o método de buscar URL conforme o encurtamento
console.log(`4. BUSCANDO PELO ENCURTAMENTO (${novaUrl1.codigo} e ${novaUrl1.url_encurtada}):`);
const buscaPorCodigo = encurtador.buscarPorEncurtamento(novaUrl1.codigo);
const buscaPorLinkCompleto = encurtador.buscarPorEncurtamento(novaUrl1.url_encurtada);

console.log('Busca passando apenas o código curto:', buscaPorCodigo);
console.log('Busca passando a URL encurtada completa:', buscaPorLinkCompleto);
console.log('--------------------------------------------------\n');

console.log(' Todos os 4 métodos foram executados com sucesso!');
