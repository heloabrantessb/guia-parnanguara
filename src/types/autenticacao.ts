export interface Usuario {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  foto_perfil?: string | null;
  criado_em: string;
}

export interface RespostaLogin {
  usuario: Usuario;
  token: string;
}

export interface CredenciaisLogin {
  email: string;
  senha: string;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}
