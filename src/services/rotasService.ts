import { request } from './api';
import { Rota } from '@/types/rota';

function formatarCaminhoRotas(sufixo: string): string {
  const urlBase = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');
  const prefixo = urlBase.endsWith('/v1') ? '/rotas' : '/v1/rotas';
  return `${prefixo}${sufixo}`;
}

function criarCabecalhosAutenticacao(tokenAcesso: string): Record<string, string> {
  if (!tokenAcesso.trim()) {
    throw new Error('Entre na sua conta para acessar seus roteiros.');
  }
  return { Authorization: `Bearer ${tokenAcesso}` };
}

export async function listarRotas(tokenAcesso: string): Promise<Rota[]> {
  return request<Rota[]>(formatarCaminhoRotas('/'), {
    headers: criarCabecalhosAutenticacao(tokenAcesso),
  });
}

export async function buscarRotaPorId(rotaId: number, tokenAcesso: string): Promise<Rota> {
  return request<Rota>(formatarCaminhoRotas(`/${rotaId}`), {
    headers: criarCabecalhosAutenticacao(tokenAcesso),
  });
}

export async function criarRota(titulo: string, tokenAcesso: string): Promise<Rota> {
  return request<Rota>(formatarCaminhoRotas('/'), {
    method: 'POST',
    headers: criarCabecalhosAutenticacao(tokenAcesso),
    body: JSON.stringify({ titulo }),
  });
}

export async function criarRotaManual(
  titulo: string,
  atrativoIds: number[],
  tokenAcesso: string
): Promise<Rota> {
  return request<Rota>(formatarCaminhoRotas('/'), {
    method: 'POST',
    headers: criarCabecalhosAutenticacao(tokenAcesso),
    body: JSON.stringify({ titulo, atrativo_ids: atrativoIds }),
  });
}

export async function renomearRota(
  rotaId: number,
  titulo: string,
  tokenAcesso: string
): Promise<Rota> {
  return request<Rota>(formatarCaminhoRotas(`/${rotaId}`), {
    method: 'PATCH',
    headers: criarCabecalhosAutenticacao(tokenAcesso),
    body: JSON.stringify({ titulo }),
  });
}

export async function removerRota(rotaId: number, tokenAcesso: string): Promise<void> {
  await request<void>(formatarCaminhoRotas(`/${rotaId}`), {
    method: 'DELETE',
    headers: criarCabecalhosAutenticacao(tokenAcesso),
  });
}
