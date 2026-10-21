import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CoresTema } from '@/utils/theme';
import { useTema } from '@/contexts/TemaContext';

const etapasApresentacao = [
  {
    titulo: 'Descubra Paranaguá',
    descricao:
      'Explore o encanto da cidade mais antiga do Paraná e mergulhe em sua rica cultura.',
    icone: 'location-outline',
  },
  {
    titulo: 'Aprenda a História',
    descricao:
      'Conheça o Centro Histórico, o Fandango Caiçara e as tradições marítimas da região.',
    icone: 'book-outline',
  },
  {
    titulo: 'Planeje sua visita',
    descricao:
      'Descubra locais e eventos e encontre as informações para aproveitar seu passeio.',
    icone: 'compass-outline',
  },
] as const;

interface TelaApresentacaoProps {
  aoConcluir: () => Promise<void>;
}

export function TelaApresentacao({ aoConcluir }: TelaApresentacaoProps) {
  const { cores } = useTema();
  const estilos = criarEstilos(cores);
  const [etapaAtual, definirEtapaAtual] = useState(0);
  const [estaSalvando, definirEstaSalvando] = useState(false);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const etapa = etapasApresentacao[etapaAtual];
  const ehUltimaEtapa = etapaAtual === etapasApresentacao.length - 1;

  async function concluirApresentacao() {
    if (estaSalvando) return;
    definirEstaSalvando(true);
    definirMensagemErro(null);
    try {
      await aoConcluir();
    } catch {
      definirMensagemErro('Não foi possível salvar. Tente novamente para continuar.');
    } finally {
      definirEstaSalvando(false);
    }
  }

  function avancarEtapa() {
    definirEtapaAtual((indiceEtapa) => indiceEtapa + 1);
  }

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: cores.background }]}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <ImageBackground
          source={require('../../assets/museu.jpeg')}
          style={estilos.imagem}
          imageStyle={estilos.bordasImagem}
          accessibilityLabel="Patrimônio histórico de Paranaguá"
        >
          <View style={estilos.sobreposicaoImagem}>
            <TouchableOpacity
              onPress={concluirApresentacao}
              disabled={estaSalvando}
              style={estilos.botaoPular}
              accessibilityRole="button"
              accessibilityLabel="Pular apresentação"
            >
              <Text style={estilos.textoPular}>Pular</Text>
            </TouchableOpacity>
            <Text style={estilos.nomeGuia}>Guia Parnanguara</Text>
          </View>
        </ImageBackground>

        <View
          style={estilos.indicadores}
          accessible
          accessibilityLabel={`Etapa ${etapaAtual + 1} de ${etapasApresentacao.length}`}
        >
          {etapasApresentacao.map((itemEtapa, indiceEtapa) => (
            <View
              key={itemEtapa.titulo}
              style={[
                estilos.indicador,
                { backgroundColor: cores.backgroundSelected },
                indiceEtapa === etapaAtual && estilos.indicadorAtivo,
              ]}
            />
          ))}
        </View>

        <View style={[estilos.icone, { backgroundColor: cores.backgroundElement }]}>
          <Ionicons name={etapa.icone} size={32} color={cores.principal} />
        </View>
        <Text
          style={[estilos.titulo, { color: cores.text }]}
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
        >
          {etapa.titulo}
        </Text>
        <Text style={[estilos.descricao, { color: cores.textSecondary }]}>
          {etapa.descricao}
        </Text>
        {mensagemErro && (
          <Text style={estilos.erro} accessibilityRole="alert">
            {mensagemErro}
          </Text>
        )}
        <TouchableOpacity
          style={[estilos.botaoContinuar, estaSalvando && estilos.botaoDesabilitado]}
          onPress={ehUltimaEtapa ? concluirApresentacao : avancarEtapa}
          disabled={estaSalvando}
          accessibilityRole="button"
          accessibilityState={{ disabled: estaSalvando, busy: estaSalvando }}
        >
          {estaSalvando ? (
            <ActivityIndicator color="#FFFFFF" accessibilityLabel="Salvando apresentação" />
          ) : (
            <Text style={estilos.textoContinuar}>
              {ehUltimaEtapa ? 'Começar' : 'Continuar'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  tela: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 28,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  imagem: { width: '100%', height: 300 },
  bordasImagem: { borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  sobreposicaoImagem: {
    flex: 1,
    backgroundColor: 'rgba(12, 51, 77, 0.4)',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    padding: 20,
    justifyContent: 'space-between',
  },
  botaoPular: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  textoPular: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  nomeGuia: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  indicadores: { flexDirection: 'row', gap: 8, marginVertical: 28 },
  indicador: { width: 8, height: 8, borderRadius: 4 },
  indicadorAtivo: { width: 24, backgroundColor: cores.acao },
  icone: { padding: 16, borderRadius: 18, marginBottom: 20 },
  titulo: { fontSize: 26, fontWeight: '700', textAlign: 'center', paddingHorizontal: 24 },
  descricao: {
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  erro: { color: cores.perigo, textAlign: 'center', paddingHorizontal: 24, marginBottom: 16 },
  botaoContinuar: {
    alignSelf: 'stretch',
    marginHorizontal: 24,
    marginTop: 'auto',
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: cores.acao,
  },
  botaoDesabilitado: { opacity: 0.6 },
  textoContinuar: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
});
