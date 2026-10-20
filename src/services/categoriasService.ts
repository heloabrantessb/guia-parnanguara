import { request } from './api';
import { Categoria } from '@/types/categoria';

function formatarCaminhoCategorias(caminho: string): string {
  const urlBase = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');
  const basePossuiV1 = urlBase.toLowerCase().endsWith('/v1');
  const caminhoPossuiV1 = caminho.toLowerCase().startsWith('/v1');

  if (basePossuiV1 && caminhoPossuiV1) {
    return caminho.replace(/^\/v1/i, '');
  }
  if (!basePossuiV1 && !caminhoPossuiV1) {
    return `/v1${caminho.startsWith('/') ? caminho : `/${caminho}`}`;
  }
  return caminho;
}

export async function listarCategorias(): Promise<Categoria[]> {
  const caminho = formatarCaminhoCategorias('/categorias/');
  const categorias = await request<Categoria[] | null>(caminho);
  return categorias ?? [];
}

export async function buscarCategoriaPorId(
  categoriaId: number
): Promise<Categoria> {
  const caminho = formatarCaminhoCategorias(`/categorias/${categoriaId}`);
  return request<Categoria>(caminho);
}
