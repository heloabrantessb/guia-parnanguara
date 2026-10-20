const teste = require('node:test');
const verificar = require('node:assert/strict');
const { readFileSync: lerArquivo } = require('node:fs');
const { resolve: resolverCaminho } = require('node:path');
const { runInNewContext: executarModulo } = require('node:vm');
const { transpileModule: compilarModulo, ModuleKind: TipoModulo } = require('typescript');

function carregarModulo(caminho, ambiente) {
  const codigo = compilarModulo(lerArquivo(resolverCaminho(__dirname, caminho), 'utf8'), {
    compilerOptions: { module: TipoModulo.CommonJS },
  }).outputText;
  const contexto = { exports: {}, ...ambiente };
  executarModulo(codigo, contexto);
  return contexto.exports;
}

function carregarServico(urlBase, request) {
  return carregarModulo('../src/services/rotasService.ts', {
    process: { env: { EXPO_PUBLIC_API_URL: urlBase } },
    require: (modulo) => {
      verificar.equal(modulo, './api');
      return { request };
    },
  });
}

for (const urlBase of ['http://api.exemplo', 'http://api.exemplo/', 'http://api.exemplo/v1', 'http://api.exemplo/v1/']) {
  teste(`normaliza o prefixo para ${urlBase} e envia autenticação`, async () => {
    const chamadas = [];
    const servico = carregarServico(urlBase, async (caminho, opcoes) => {
      chamadas.push({ caminho, opcoes });
      return [];
    });
    await servico.listarRotas('token-ficticio');
    const chamada = chamadas[0];
    verificar.equal(chamada.caminho, urlBase.replace(/\/$/, '').endsWith('/v1') ? '/rotas/' : '/v1/rotas/');
    verificar.equal(chamada.opcoes.headers.Authorization, 'Bearer token-ficticio');
  });
}

teste('usa os contratos existentes para criar, consultar, renomear e remover', async () => {
  const chamadas = [];
  const rota = { id: 7, titulo: 'Passeio', criado_em: '2026-10-16T12:00:00Z', itens: [] };
  const servico = carregarServico('http://api.exemplo/v1', async (caminho, opcoes) => {
    chamadas.push({ caminho, opcoes });
    return rota;
  });
  verificar.equal(await servico.criarRota('Passeio', 'token-ficticio'), rota);
  verificar.equal(await servico.buscarRotaPorId(7, 'token-ficticio'), rota);
  verificar.equal(await servico.renomearRota(7, 'Novo passeio', 'token-ficticio'), rota);
  verificar.equal(await servico.removerRota(7, 'token-ficticio'), undefined);
  verificar.deepEqual(chamadas.map((chamada) => chamada.caminho), [
    '/rotas/', '/rotas/7', '/rotas/7', '/rotas/7',
  ]);
  verificar.deepEqual(chamadas.map((chamada) => chamada.opcoes.method), [
    'POST', undefined, 'PATCH', 'DELETE',
  ]);
  verificar.deepEqual(JSON.parse(chamadas[0].opcoes.body), { titulo: 'Passeio' });
  verificar.deepEqual(JSON.parse(chamadas[2].opcoes.body), { titulo: 'Novo passeio' });
  for (const chamada of chamadas) {
    verificar.equal(chamada.opcoes.headers.Authorization, 'Bearer token-ficticio');
  }
});

teste('não faz chamadas sem token', async () => {
  const servico = carregarServico('http://api.exemplo', async () => verificar.fail('Chamada sem autenticação'));
  await verificar.rejects(servico.listarRotas(' '), /Entre na sua conta/);
  await verificar.rejects(servico.criarRota('Passeio', ''), /Entre na sua conta/);
  await verificar.rejects(servico.criarRotaManual('Passeio', [1], ''), /Entre na sua conta/);
  await verificar.rejects(servico.buscarRotaPorId(1, ''), /Entre na sua conta/);
  await verificar.rejects(servico.renomearRota(1, 'Passeio', ''), /Entre na sua conta/);
  await verificar.rejects(servico.removerRota(1, ''), /Entre na sua conta/);
});

teste('cria roteiro manual com paradas na ordem escolhida em uma chamada autenticada', async () => {
  const chamadas = [];
  const rota = { id: 7, titulo: 'Passeio', itens: [] };
  const servico = carregarServico('http://api.exemplo/v1/', async (caminho, opcoes) => {
    chamadas.push({ caminho, opcoes });
    return rota;
  });
  verificar.equal(await servico.criarRotaManual('Passeio', [8, 3], 'token-ficticio'), rota);
  verificar.equal(chamadas.length, 1);
  verificar.equal(chamadas[0].caminho, '/rotas/');
  verificar.equal(chamadas[0].opcoes.method, 'POST');
  verificar.equal(chamadas[0].opcoes.headers.Authorization, 'Bearer token-ficticio');
  verificar.deepEqual(JSON.parse(chamadas[0].opcoes.body), { titulo: 'Passeio', atrativo_ids: [8, 3] });
});

teste('criação manual preserva falha da API sem simular roteiro salvo', async () => {
  const erroApi = new Error('Um ou mais atrativos não estão disponíveis.');
  const servico = carregarServico('http://api.exemplo', async () => { throw erroApi; });
  await verificar.rejects(servico.criarRotaManual('Passeio', [8], 'token-ficticio'), (erro) => erro === erroApi);
});

teste('preserva falhas da API em vez de simular sucesso', async () => {
  const erroApi = new Error('Sessão expirada');
  const servico = carregarServico('http://api.exemplo', async () => { throw erroApi; });
  await verificar.rejects(servico.listarRotas('token-ficticio'), (erro) => erro === erroApi);
  await verificar.rejects(servico.removerRota(1, 'token-ficticio'), (erro) => erro === erroApi);
});

teste('request aceita exclusão com resposta 204 sem ler JSON', async () => {
  const api = carregarModulo('../src/services/api.ts', {
    process: { env: { EXPO_PUBLIC_API_URL: 'http://api.exemplo' } },
    fetch: async () => ({
      ok: true, status: 204,
      json: () => verificar.fail('Resposta 204 não tem JSON'),
    }),
  });
  verificar.equal(await api.request('/v1/rotas/7', { method: 'DELETE' }), undefined);
});

teste('request continua lendo JSON e rejeitando falhas de exclusão', async () => {
  const rota = { id: 7, titulo: 'Passeio', itens: [] };
  const api = carregarModulo('../src/services/api.ts', {
    process: { env: { EXPO_PUBLIC_API_URL: 'http://api.exemplo' } },
    fetch: async (_, opcoes) => opcoes?.method === 'DELETE'
      ? { ok: false, status: 403, json: async () => ({ error: 'Acesso negado' }) }
      : { ok: true, status: 200, json: async () => rota },
  });
  verificar.equal(await api.request('/v1/rotas/7'), rota);
  await verificar.rejects(api.request('/v1/rotas/7', { method: 'DELETE' }), /Acesso negado/);
});
