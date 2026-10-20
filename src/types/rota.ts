import { Local } from './local';

export type AtrativoRota = Omit<Local, 'horario_abertura' | 'horario_fechamento'>;

export interface ItemRota {
  id: number;
  ordem: number;
  atrativo: AtrativoRota;
  chegada_em?: string | null;
  saida_em?: string | null;
  deslocamento_minutos?: number | null;
  espera_minutos?: number | null;
  duracao_visita_minutos?: number | null;
}

export interface Rota {
  id: number;
  titulo: string;
  criado_em: string;
  itens: ItemRota[];
  tempo_disponivel_minutos?: number | null;
  duracao_estimada_minutos?: number | null;
  inicio_em?: string | null;
}

export interface SolicitacaoGeracaoRota {
  titulo: string;
  tempo_disponivel_minutos: number;
  categoria_ids: number[];
}
