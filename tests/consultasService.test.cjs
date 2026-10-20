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

function carregarServico(arquivo, urlBase, fetch) {
  const ambiente = { process: { env: { EXPO_PUBLIC_API_URL: urlBase } }, fetch };
  const api = carregarModulo('../src/services/api.ts', ambiente);
  return carregarModulo(`../src/services/${arquivo}.ts`, {
    ...ambiente,
    require: (modulo) => {
      verificar.equal(modulo, './api');
      return api;
    },
  });
}

const consultas = [
  { arquivo: 'categoriasService', recurso: 'categorias', listar: 'listarCategorias', buscar: 'buscarCategoriaPorId' },
  { arquivo: 'locaisService', recurso: 'locais', listar: 'listarLocais', buscar: 'buscarLocalPorId' },
  { arquivo: 'eventosService', recurso: 'eventos', listar: 'listarEventos', buscar: 'buscarEventoPorId' },
];

for (const consulta of consultas) {
  for (const urlBase of ['http://api.exemplo', 'http://api.exemplo/', 'http://api.exemplo/v1', 'http://api.exemplo/v1/']) {
    teste(`${consulta.recurso}: lista e detalhe com base ${urlBase}`, async () => {
      const chamadas = [];
      const atrativo = { id: 7 };
      const lista = [atrativo];
      const servico = carregarServico(consulta.arquivo, urlBase, async (url) => {
        chamadas.push(url);
        return { ok: true, status: 200, json: async () => url.endsWith('/') ? lista : atrativo };
      });
      verificar.equal(await servico[consulta.listar](), lista);
      verificar.equal(await servico[consulta.buscar](7), atrativo);
      verificar.deepEqual(chamadas, [
        `http://api.exemplo/v1/${consulta.recurso}/`,
        `http://api.exemplo/v1/${consulta.recurso}/7`,
      ]);
    });
  }

  teste(`${consulta.recurso}: preserva listas vazias e converte null em lista vazia`, async () => {
    for (const resposta of [[], null]) {
      const servico = carregarServico(consulta.arquivo, 'http://api.exemplo/v1/', async () => ({
        ok: true, status: 200, json: async () => resposta,
      }));
      verificar.equal((await servico[consulta.listar]()).length, 0);
    }
  });

  teste(`${consulta.recurso}: propaga erros nas consultas`, async () => {
    const erroConexao = new Error('Falha de conexão');
    const servico = carregarServico(consulta.arquivo, 'http://api.exemplo/v1/', async () => { throw erroConexao; });
    await verificar.rejects(servico[consulta.listar](), (erro) => erro === erroConexao);
    await verificar.rejects(servico[consulta.buscar](7), (erro) => erro === erroConexao);
  });
}
