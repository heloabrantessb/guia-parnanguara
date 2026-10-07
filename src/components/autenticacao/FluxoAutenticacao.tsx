import { useState } from 'react';
import { TelaLogin } from './TelaLogin';
import { TelaCadastro } from './TelaCadastro';

type TelaAtiva = 'login' | 'cadastro';

export function FluxoAutenticacao() {
  const [telaAtiva, setTelaAtiva] = useState<TelaAtiva>('login');

  if (telaAtiva === 'cadastro') {
    return <TelaCadastro aoNavegarLogin={() => setTelaAtiva('login')} />;
  }

  return <TelaLogin aoNavegarCadastro={() => setTelaAtiva('cadastro')} />;
}
