import { CategoriaLocal, ImagemLocal } from './local';

export interface Evento {
  id: number;
  nome: string;
  descricao: string;
  endereco: string;
  latitude: string | number;
  longitude: string | number;
  ativo: boolean;
  valor_entrada: string | number | null;
  categorias: CategoriaLocal[];
  imagens: ImagemLocal[];
  criado_em: string;
  atualizado_em: string;
  data_inicio: string;
  data_fim: string;
}
