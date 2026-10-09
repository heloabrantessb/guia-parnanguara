import { request } from './api';
import { Local } from '@/types/local';

function formatarCaminhoLocais(caminho: string): string {
  const urlBase = process.env.EXPO_PUBLIC_API_URL || '';
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

export async function listarLocais(): Promise<Local[]> {
  const caminho = formatarCaminhoLocais('/locais/');
  const locais = await request<Local[] | null>(caminho);
  return locais ?? [];
}

export async function buscarLocalPorId(localId: number): Promise<Local> {
  const caminho = formatarCaminhoLocais(`/locais/${localId}`);
  return request<Local>(caminho);
}
