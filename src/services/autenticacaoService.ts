import AsyncStorage from '@react-native-async-storage/async-storage';
import { request } from './api';
import {
  CredenciaisLogin,
  DadosCadastro,
  RespostaLogin,
  Usuario,
} from '@/types/autenticacao';

const CHAVE_TOKEN = '@guia_parnanguara:token';
const CHAVE_USUARIO = '@guia_parnanguara:usuario';

function formatarCaminhoAutenticacao(sufixo: string): string {
  const urlBase = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');
  const prefixo = urlBase.endsWith('/v1') ? '/usuarios' : '/v1/usuarios';
  return `${prefixo}${sufixo}`;
}

export async function realizarLogin(
  credenciais: CredenciaisLogin
): Promise<RespostaLogin> {
  return request<RespostaLogin>(formatarCaminhoAutenticacao('/login'), {
    method: 'POST',
    body: JSON.stringify(credenciais),
  });
}

export async function cadastrarUsuario(
  dados: DadosCadastro
): Promise<Usuario> {
  return request<Usuario>(formatarCaminhoAutenticacao('/registro'), {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function salvarSessaoStorage(
  token: string,
  usuario: Usuario
): Promise<void> {
  await AsyncStorage.multiSet([
    [CHAVE_TOKEN, token],
    [CHAVE_USUARIO, JSON.stringify(usuario)],
  ]);
}

export async function obterSessaoStorage(): Promise<{
  token: string | null;
  usuario: Usuario | null;
}> {
  const [parToken, parUsuario] = await AsyncStorage.multiGet([
    CHAVE_TOKEN,
    CHAVE_USUARIO,
  ]);

  const token = parToken[1] || null;
  let usuario: Usuario | null = null;

  if (parUsuario[1]) {
    try {
      usuario = JSON.parse(parUsuario[1]) as Usuario;
    } catch {
      usuario = null;
    }
  }

  return { token, usuario };
}

export async function removerSessaoStorage(): Promise<void> {
  await AsyncStorage.multiRemove([CHAVE_TOKEN, CHAVE_USUARIO]);
}
