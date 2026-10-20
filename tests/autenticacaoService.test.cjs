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

function carregarServico(urlBase, fetch) {
  const ambiente = { process: { env: { EXPO_PUBLIC_API_URL: urlBase } } };
  const api = carregarModulo('../src/services/api.ts', { ...ambiente, fetch });
  return carregarModulo('../src/services/autenticacaoService.ts', {
    ...ambiente,
    require: (modulo) => {
      if (modulo === './api') return api;
      verificar.equal(modulo, '@react-native-async-storage/async-storage');
      return { default: {} };
    },
  });
}

for (const urlBase of ['http://api.exemplo', 'http://api.exemplo/', 'http://api.exemplo/v1', 'http://api.exemplo/v1/']) {
  teste(`login e cadastro usam os endereços da API com base ${urlBase}`, async () => {
    const chamadas = [];
    const usuario = { id: 1, nome: 'Maria', email: 'maria@example.com', funcao: 'USUARIO', criado_em: '2026-10-20T12:00:00Z' };
    const respostaLogin = { usuario, token: 'token-ficticio' };
    const servico = carregarServico(urlBase, async (url, opcoes) => {
      chamadas.push({ url, opcoes });
      return { ok: true, status: 200, json: async () => url.endsWith('/login') ? respostaLogin : usuario };
    });
    const credenciais = { email: usuario.email, senha: 'senha-ficticia' };
    const cadastro = { ...credenciais, nome: usuario.nome };

    verificar.equal(await servico.realizarLogin(credenciais), respostaLogin);
    verificar.equal(await servico.cadastrarUsuario(cadastro), usuario);
    verificar.deepEqual(chamadas.map((chamada) => chamada.url), [
      'http://api.exemplo/v1/usuarios/login',
      'http://api.exemplo/v1/usuarios/registro',
    ]);
    for (const chamada of chamadas) {
      verificar.equal(chamada.opcoes.method, 'POST');
      verificar.equal(chamada.opcoes.headers['Content-Type'], 'application/json');
    }
    verificar.deepEqual(JSON.parse(chamadas[0].opcoes.body), credenciais);
    verificar.deepEqual(JSON.parse(chamadas[1].opcoes.body), cadastro);
  });
}

teste('login e cadastro preservam as mensagens de erro da API', async () => {
  const servico = carregarServico('http://api.exemplo', async (url) => ({
    ok: false,
    status: url.endsWith('/login') ? 401 : 409,
    json: async () => ({ error: url.endsWith('/login') ? 'Email ou senha inválidos' : 'Email já cadastrado' }),
  }));
  const credenciais = { email: 'maria@example.com', senha: 'senha-ficticia' };
  await verificar.rejects(servico.realizarLogin(credenciais), /Email ou senha inválidos/);
  await verificar.rejects(servico.cadastrarUsuario({ ...credenciais, nome: 'Maria' }), /Email já cadastrado/);
});

teste('login e cadastro propagam falhas de rede', async () => {
  const erroConexao = new Error('Falha de conexão');
  const servico = carregarServico('http://api.exemplo', async () => { throw erroConexao; });
  const credenciais = { email: 'maria@example.com', senha: 'senha-ficticia' };
  await verificar.rejects(servico.realizarLogin(credenciais), (erro) => erro === erroConexao);
  await verificar.rejects(servico.cadastrarUsuario({ ...credenciais, nome: 'Maria' }), (erro) => erro === erroConexao);
});
