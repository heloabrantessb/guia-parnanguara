import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  CredenciaisLogin,
  DadosCadastro,
  Usuario,
} from '@/types/autenticacao';
import {
  cadastrarUsuario,
  obterSessaoStorage,
  realizarLogin,
  removerSessaoStorage,
  salvarSessaoStorage,
} from '@/services/autenticacaoService';

interface AutenticacaoContextProps {
  usuario: Usuario | null;
  tokenAcesso: string | null;
  ehVisitante: boolean;
  estaCarregando: boolean;
  estaAutenticado: boolean;
  entrar: (credenciais: CredenciaisLogin) => Promise<void>;
  cadastrar: (dados: DadosCadastro) => Promise<void>;
  entrarComoVisitante: () => void;
  sairDaConta: () => Promise<void>;
}

const AutenticacaoContext = createContext<AutenticacaoContextProps | undefined>(
  undefined
);

interface AutenticacaoProviderProps {
  children: ReactNode;
}

export function AutenticacaoProvider({ children }: AutenticacaoProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [tokenAcesso, setTokenAcesso] = useState<string | null>(null);
  const [ehVisitante, setEhVisitante] = useState(false);
  const [estaCarregando, setEstaCarregando] = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const { token, usuario: usuarioSalvo } = await obterSessaoStorage();
        if (token && usuarioSalvo) {
          setTokenAcesso(token);
          setUsuario(usuarioSalvo);
        }
      } catch {
        // Se houver falha ao ler o storage, permanece deslogado
      } finally {
        setEstaCarregando(false);
      }
    }

    restaurarSessao();
  }, []);

  async function entrar(credenciais: CredenciaisLogin): Promise<void> {
    const resposta = await realizarLogin(credenciais);
    await salvarSessaoStorage(resposta.token, resposta.usuario);
    setTokenAcesso(resposta.token);
    setUsuario(resposta.usuario);
    setEhVisitante(false);
  }

  async function cadastrar(dados: DadosCadastro): Promise<void> {
    await cadastrarUsuario(dados);
    // Apos o cadastro com sucesso, realiza o login automaticamente
    await entrar({
      email: dados.email,
      senha: dados.senha,
    });
  }

  function entrarComoVisitante() {
    setUsuario(null);
    setTokenAcesso(null);
    setEhVisitante(true);
  }

  async function sairDaConta(): Promise<void> {
    await removerSessaoStorage();
    setUsuario(null);
    setTokenAcesso(null);
    setEhVisitante(false);
  }

  const estaAutenticado = Boolean(tokenAcesso || ehVisitante);

  return (
    <AutenticacaoContext.Provider
      value={{
        usuario,
        tokenAcesso,
        ehVisitante,
        estaCarregando,
        estaAutenticado,
        entrar,
        cadastrar,
        entrarComoVisitante,
        sairDaConta,
      }}
    >
      {children}
    </AutenticacaoContext.Provider>
  );
}

export function useAutenticacao(): AutenticacaoContextProps {
  const contexto = useContext(AutenticacaoContext);
  if (!contexto) {
    throw new Error(
      'useAutenticacao deve ser utilizado dentro de um AutenticacaoProvider'
    );
  }
  return contexto;
}
