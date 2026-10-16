import { Local } from './local';

export type AtrativoRota = Omit<Local, 'horario_abertura' | 'horario_fechamento'>;

export interface ItemRota {
  id: number;
  ordem: number;
  atrativo: AtrativoRota;
}

export interface Rota {
  id: number;
  titulo: string;
  criado_em: string;
  itens: ItemRota[];
}
