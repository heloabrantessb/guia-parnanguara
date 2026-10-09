import { request } from './api';
import { Evento } from '@/types/evento';

function formatarCaminhoEventos(caminho: string): string {
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

export async function listarEventos(): Promise<Evento[]> {
  const caminho = formatarCaminhoEventos('/eventos/');
  const eventos = await request<Evento[] | null>(caminho);
  return eventos ?? [];
}

export async function buscarEventoPorId(eventoId: number): Promise<Evento> {
  const caminho = formatarCaminhoEventos(`/eventos/${eventoId}`);
  return request<Evento>(caminho);
}
