import { request } from './api';
import { Categoria } from '@/types/categoria';

function formatarCaminhoPreferencias(): string {
  const urlBase = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');
  return urlBase.endsWith('/v1') ? '/preferencias/' : '/v1/preferencias/';
}

function criarCabecalhosPreferencias(tokenAcesso: string): Record<string, string> {
  if (!tokenAcesso.trim()) throw new Error('Entre na sua conta para acessar suas preferências.');
  return { Authorization: `Bearer ${tokenAcesso}` };
}

export async function buscarPreferencias(tokenAcesso: string): Promise<Categoria[]> {
  return request<Categoria[]>(formatarCaminhoPreferencias(), {
    headers: criarCabecalhosPreferencias(tokenAcesso),
  });
}

export async function salvarPreferencias(categoriaIds: number[], tokenAcesso: string): Promise<Categoria[]> {
  return request<Categoria[]>(formatarCaminhoPreferencias(), {
    method: 'POST',
    headers: criarCabecalhosPreferencias(tokenAcesso),
    body: JSON.stringify({ categoria_ids: categoriaIds }),
  });
}
