import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { TelaLogin } from './TelaLogin';
import { TelaCadastro } from './TelaCadastro';
import { TelaApresentacao } from './TelaApresentacao';
import {
  buscarApresentacaoConcluida,
  salvarApresentacaoConcluida,
} from '@/services/apresentacaoService';
import { useTema } from '@/contexts/TemaContext';

type TelaAtiva = 'login' | 'cadastro';

export function FluxoAutenticacao() {
  const [telaAtiva, setTelaAtiva] = useState<TelaAtiva>('login');
  const [apresentacaoConcluida, definirApresentacaoConcluida] = useState<
    boolean | null
  >(null);
  const { cores } = useTema();

  useEffect(() => {
    let estaMontado = true;

    async function carregarApresentacao() {
      try {
        const foiConcluida = await buscarApresentacaoConcluida();
        if (estaMontado) definirApresentacaoConcluida(foiConcluida);
      } catch {
        // Sem acesso à preferência local, permite conhecer o app novamente.
        if (estaMontado) definirApresentacaoConcluida(false);
      }
    }

    carregarApresentacao();
    return () => {
      estaMontado = false;
    };
  }, []);

  async function concluirApresentacao() {
    await salvarApresentacaoConcluida();
    definirApresentacaoConcluida(true);
  }

  if (apresentacaoConcluida === null) {
    return (
      <View style={[estilos.carregamento, { backgroundColor: cores.background }]}>
        <ActivityIndicator color={cores.principal} accessibilityLabel="Carregando apresentação" />
      </View>
    );
  }

  if (!apresentacaoConcluida) {
    return <TelaApresentacao aoConcluir={concluirApresentacao} />;
  }

  if (telaAtiva === 'cadastro') {
    return <TelaCadastro aoNavegarLogin={() => setTelaAtiva('login')} />;
  }

  return <TelaLogin aoNavegarCadastro={() => setTelaAtiva('cadastro')} />;
}

const estilos = StyleSheet.create({
  carregamento: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
