const teste = require('node:test');
const verificar = require('node:assert/strict');
const { readFileSync: lerArquivo } = require('node:fs');
const { resolve: resolverCaminho } = require('node:path');
const { runInNewContext: executarModulo } = require('node:vm');
const { transpileModule: compilarModulo, ModuleKind: TipoModulo } = require('typescript');

function carregarServico(urlBase, request) {
  const codigo = compilarModulo(lerArquivo(resolverCaminho(__dirname, '../src/services/preferenciasService.ts'), 'utf8'), {
    compilerOptions: { module: TipoModulo.CommonJS },
  }).outputText;
  const contexto = {
    exports: {}, process: { env: { EXPO_PUBLIC_API_URL: urlBase } },
    require: (modulo) => { verificar.equal(modulo, './api'); return { request }; },
  };
  executarModulo(codigo, contexto);
  return contexto.exports;
}

for (const urlBase of ['http://api.exemplo', 'http://api.exemplo/', 'http://api.exemplo/v1', 'http://api.exemplo/v1/']) {
  teste(`preferências consultadas e salvas com base ${urlBase}`, async () => {
    const chamadas = [];
    const preferencias = [{ id: 3, titulo: 'Cultura' }];
    const servico = carregarServico(urlBase, async (caminho, opcoes) => {
      chamadas.push({ caminho, opcoes });
      return preferencias;
    });
    verificar.equal(await servico.buscarPreferencias('token-ficticio'), preferencias);
    verificar.equal(await servico.salvarPreferencias([3], 'token-ficticio'), preferencias);
    for (const chamada of chamadas) {
      verificar.equal(chamada.caminho, urlBase.replace(/\/$/, '').endsWith('/v1') ? '/preferencias/' : '/v1/preferencias/');
      verificar.equal(chamada.opcoes.headers.Authorization, 'Bearer token-ficticio');
    }
    verificar.equal(chamadas[0].opcoes.method, undefined);
    verificar.equal(chamadas[1].opcoes.method, 'POST');
    verificar.deepEqual(JSON.parse(chamadas[1].opcoes.body), { categoria_ids: [3] });
  });
}

teste('não consulta nem altera preferências sem token', async () => {
  const servico = carregarServico('http://api.exemplo', async () => verificar.fail('Chamada sem token'));
  await verificar.rejects(servico.buscarPreferencias(' '), /Entre na sua conta/);
  await verificar.rejects(servico.salvarPreferencias([3], ''), /Entre na sua conta/);
});

teste('salva seleção vazia para limpar preferências e propaga falhas', async () => {
  const servico = carregarServico('http://api.exemplo', async (_, opcoes) => {
    verificar.deepEqual(JSON.parse(opcoes.body), { categoria_ids: [] });
    return [];
  });
  verificar.equal((await servico.salvarPreferencias([], 'token-ficticio')).length, 0);
  const erroApi = new Error('Sessão expirada');
  const servicoComFalha = carregarServico('http://api.exemplo', async () => { throw erroApi; });
  await verificar.rejects(servicoComFalha.buscarPreferencias('token-ficticio'), (erro) => erro === erroApi);
  await verificar.rejects(servicoComFalha.salvarPreferencias([3], 'token-ficticio'), (erro) => erro === erroApi);
});
