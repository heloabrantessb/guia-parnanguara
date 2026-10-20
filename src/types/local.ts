import { Categoria } from './categoria';

export type CategoriaLocal = Categoria;

export interface ImagemLocal {
  id: number;
  imagem_url: string | null;
  imagem_capa: boolean;
  criado_em: string;
}

export interface Local {
  id: number;
  nome: string;
  descricao: string;
  endereco: string;
  latitude: string | number;
  longitude: string | number;
  ativo: boolean;
  duracao_visita_minutos: number;
  valor_entrada: string | number | null;
  categorias: CategoriaLocal[];
  imagens: ImagemLocal[];
  criado_em: string;
  atualizado_em: string;
  horario_abertura: string;
  horario_fechamento: string;
}
