import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EventoCard } from '@/components/cards/EventoCard';
import { DetalheAtrativoModal } from '@/components/DetalheAtrativoModal';
import { listarEventos } from '@/services/eventosService';
import { Evento } from '@/types/evento';
import { CoresTema } from '@/utils/theme';
import { useTema } from '@/contexts/TemaContext';

export default function TelaEventos() {
  const { cores } = useTema();
  const estilos = criarEstilos(cores);
  const [eventos, definirEventos] = useState<Evento[]>([]);
  const [estaCarregando, definirEstaCarregando] = useState(true);
  const [estaAtualizando, definirEstaAtualizando] = useState(false);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [eventoSelecionado, definirEventoSelecionado] = useState<Evento | null>(null);
  const estaBuscando = useRef(false);
  const estaMontado = useRef(false);

  const carregarEventos = useCallback(async () => {
    if (estaBuscando.current) return;
    estaBuscando.current = true;
    definirMensagemErro(null);

    try {
      const eventosRecebidos = await listarEventos();
      const eventosAtivos = eventosRecebidos
        .filter((evento) => evento.ativo)
        .sort((primeiroEvento, segundoEvento) => (
          new Date(primeiroEvento.data_inicio).getTime() -
          new Date(segundoEvento.data_inicio).getTime()
        ));
      if (estaMontado.current) definirEventos(eventosAtivos);
    } catch {
      if (estaMontado.current) {
        definirMensagemErro(
          'Não foi possível carregar os eventos. Verifique sua conexão e tente novamente.'
        );
      }
    } finally {
      estaBuscando.current = false;
      if (estaMontado.current) {
        definirEstaCarregando(false);
        definirEstaAtualizando(false);
      }
    }
  }, []);

  useEffect(() => {
    estaMontado.current = true;
    carregarEventos();
    return () => {
      estaMontado.current = false;
    };
  }, [carregarEventos]);

  function atualizarEventos() {
    if (estaBuscando.current) return;
    definirEstaAtualizando(true);
    carregarEventos();
  }

  return (
    <SafeAreaView
      style={[estilos.tela, { backgroundColor: cores.background }]}
      edges={['top']}
    >
      <FlatList
        data={eventos}
        keyExtractor={(evento) => String(evento.id)}
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={estaAtualizando}
            onRefresh={atualizarEventos}
            colors={[cores.principal]}
            tintColor={cores.principal}
          />
        }
        ListHeaderComponent={
          <View style={estilos.cabecalho}>
            <Text style={[estilos.titulo, { color: cores.text }]} accessibilityRole="header">
              Eventos
            </Text>
            <Text style={[estilos.subtitulo, { color: cores.textSecondary }]}>
              O que está rolando na cidade.
            </Text>
            {mensagemErro && (
              <View style={estilos.avisoErro}>
                <Text style={estilos.textoErro} accessibilityRole="alert">
                  {mensagemErro}
                </Text>
                <TouchableOpacity
                  onPress={atualizarEventos}
                  disabled={estaAtualizando}
                  style={estilos.botaoTentarNovamente}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: estaAtualizando }}
                >
                  <Text style={estilos.textoTentarNovamente}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        renderItem={({ item: evento }) => (
          <EventoCard
            evento={evento}
            aoPressionar={() => definirEventoSelecionado(evento)}
            estilo={estilos.cardEvento}
          >
            {evento.categorias.length > 0 && (
              <Text style={estilos.categorias}>
                {evento.categorias.map((categoria) => categoria.titulo).join(' • ')}
              </Text>
            )}
            {evento.descricao.length > 0 && (
              <Text
                style={[estilos.descricao, { color: cores.textSecondary }]}
                numberOfLines={3}
              >
                {evento.descricao}
              </Text>
            )}
          </EventoCard>
        )}
        ListEmptyComponent={
          estaCarregando ? (
            <View style={estilos.estadoVazio}>
              <ActivityIndicator size="large" color={cores.principal} />
              <Text style={[estilos.subtitulo, { color: cores.textSecondary }]}>
                Carregando eventos...
              </Text>
            </View>
          ) : !mensagemErro ? (
            <View style={[estilos.estadoVazio, { backgroundColor: cores.backgroundElement }]}>
              <Ionicons name="calendar-outline" size={44} color={cores.textSecondary} />
              <Text style={[estilos.tituloEstadoVazio, { color: cores.text }]}>
                Nenhum evento disponível
              </Text>
              <Text style={[estilos.descricaoEstadoVazio, { color: cores.textSecondary }]}>
                Novos eventos serão adicionados em breve. Puxe a lista para atualizar.
              </Text>
            </View>
          ) : null
        }
      />
      <DetalheAtrativoModal
        visivel={eventoSelecionado !== null}
        atrativo={eventoSelecionado}
        aoFechar={() => definirEventoSelecionado(null)}
      />
    </SafeAreaView>
  );
}

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { flexGrow: 1, padding: 16, paddingBottom: 32, width: '100%', maxWidth: 800, alignSelf: 'center' },
  cabecalho: { marginTop: 12, marginBottom: 24 },
  titulo: { fontSize: 28, fontWeight: '800' },
  subtitulo: { fontSize: 15, marginTop: 8 },
  cardEvento: { width: '100%', marginRight: 0, marginBottom: 20 },
  categorias: { color: cores.principal, fontSize: 12, fontWeight: '700', marginTop: 12, textTransform: 'uppercase' },
  descricao: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  avisoErro: { marginTop: 20, padding: 16, borderRadius: 12, backgroundColor: cores.perigoSuave },
  textoErro: { color: cores.perigo, fontSize: 14, lineHeight: 21 },
  botaoTentarNovamente: { paddingVertical: 12, marginTop: 4, alignSelf: 'flex-start' },
  textoTentarNovamente: { color: cores.perigo, fontSize: 14, fontWeight: '700' },
  estadoVazio: { padding: 28, borderRadius: 16, alignItems: 'center', marginTop: 16 },
  tituloEstadoVazio: { fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  descricaoEstadoVazio: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
});
