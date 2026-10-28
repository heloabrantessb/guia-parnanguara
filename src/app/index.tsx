import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { MascoteCaranguejo } from '@/components/identidade/MascoteCaranguejo';
import { SimboloLitoraneo } from '@/components/identidade/SimboloLitoraneo';
import { DestaqueCard } from '@/components/cards/destaqueCard';
import { LocalCard } from '@/components/cards/LocalCard';
import { EventoCard } from '@/components/cards/EventoCard';
import { DetalheAtrativoModal } from '@/components/DetalheAtrativoModal';
import { listarLocais } from '@/services/locaisService';
import { listarCategorias } from '@/services/categoriasService';
import { listarEventos } from '@/services/eventosService';
import { Local } from '@/types/local';
import { Categoria } from '@/types/categoria';
import { Evento } from '@/types/evento';
import { CoresTema } from '@/utils/theme';
import { useTema } from '@/contexts/TemaContext';
import { resolverUrlImagem } from '@/utils/formatadores';

const IMAGEM_PADRAO = require('../assets/museu.jpeg');

export default function TelaHome() {
  const { cores } = useTema();
  const styles = criarEstilos(cores);
  const { usuario, ehVisitante } = useAutenticacao();

  const [locais, setLocais] = useState<Local[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);

  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<
    number | null
  >(null);
  const [termoBusca, setTermoBusca] = useState('');

  const [estaCarregando, setEstaCarregando] = useState(true);
  const [estaAtualizando, setEstaAtualizando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const [atrativoSelecionado, setAtrativoSelecionado] = useState<
    Local | Evento | null
  >(null);
  const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);

  const carregarDadosHome = useCallback(async () => {
    try {
      setMensagemErro(null);

      const [resultadoCategorias, resultadoLocais, resultadoEventos] =
        await Promise.allSettled([
          listarCategorias(),
          listarLocais(),
          listarEventos(),
        ]);

      if (resultadoCategorias.status === 'fulfilled') {
        const categoriasAtivas = resultadoCategorias.value.filter(
          (categoria) => categoria.ativo
        );
        setCategorias(categoriasAtivas);
      }

      if (resultadoLocais.status === 'fulfilled') {
        const locaisAtivos = resultadoLocais.value.filter(
          (local) => local.ativo
        );
        setLocais(locaisAtivos);
      }

      if (resultadoEventos.status === 'fulfilled') {
        const eventosAtivos = resultadoEventos.value.filter(
          (evento) => evento.ativo
        );
        setEventos(eventosAtivos);
      }

      // Se todas as requisicoes falharem, exibe aviso amigavel
      if (
        resultadoCategorias.status === 'rejected' &&
        resultadoLocais.status === 'rejected' &&
        resultadoEventos.status === 'rejected'
      ) {
        setMensagemErro(
          'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.'
        );
      }
    } catch {
      setMensagemErro(
        'Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.'
      );
    } finally {
      setEstaCarregando(false);
      setEstaAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarDadosHome();
  }, [carregarDadosHome]);

  async function lidarComAtualizacao() {
    setEstaAtualizando(true);
    await carregarDadosHome();
  }

  function abrirDetalhes(atrativo: Local | Evento) {
    setAtrativoSelecionado(atrativo);
    setModalDetalhesVisivel(true);
  }

  function fecharDetalhes() {
    setModalDetalhesVisivel(false);
    setAtrativoSelecionado(null);
  }

  // Filtragem de locais por busca e categoria
  const locaisFiltrados = useMemo(() => {
    return locais.filter((local) => {
      const atendeBusca = termoBusca.trim()
        ? local.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
          local.endereco.toLowerCase().includes(termoBusca.toLowerCase()) ||
          local.descricao.toLowerCase().includes(termoBusca.toLowerCase())
        : true;

      const atendeCategoria = categoriaSelecionadaId !== null
        ? local.categorias.some(
            (categoria) => categoria.id === categoriaSelecionadaId
          )
        : true;

      return atendeBusca && atendeCategoria;
    });
  }, [locais, termoBusca, categoriaSelecionadaId]);

  // Filtragem de eventos por busca e categoria
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((evento) => {
      const atendeBusca = termoBusca.trim()
        ? evento.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
          evento.endereco.toLowerCase().includes(termoBusca.toLowerCase()) ||
          evento.descricao.toLowerCase().includes(termoBusca.toLowerCase())
        : true;

      const atendeCategoria = categoriaSelecionadaId !== null
        ? evento.categorias.some(
            (categoria) => categoria.id === categoriaSelecionadaId
          )
        : true;

      return atendeBusca && atendeCategoria;
    });
  }, [eventos, termoBusca, categoriaSelecionadaId]);

  // Destaques: locais que possuem imagens ou os primeiros cadastrados
  const locaisDestaque = useMemo(() => {
    if (locais.length === 0) return [];
    return locais.slice(0, 5);
  }, [locais]);

  const saudacaoUsuario = useMemo(() => {
    if (usuario?.nome) {
      const primeiroNome = usuario.nome.split(' ')[0];
      return `Olá, ${primeiroNome}`;
    }
    if (ehVisitante) {
      return 'Olá, Visitante';
    }
    return 'Olá!';
  }, [usuario, ehVisitante]);

  if (estaCarregando) {
    return (
      <View
        style={[
          styles.containerCentralizado,
          { backgroundColor: cores.background },
        ]}
      >
        <ActivityIndicator size="large" color={cores.principal} />
        <Text
          style={[styles.textoCarregando, { color: cores.textSecondary }]}
        >
          Carregando atrações de Paranaguá...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.containerSeguro, { backgroundColor: cores.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={estaAtualizando}
            onRefresh={lidarComAtualizacao}
            colors={[cores.principal]}
            tintColor={cores.principal}
          />
        }
      >
        {/* Cabecalho de boas-vindas */}
        <View style={styles.cabecalho}>
          <View>
            <Text style={[styles.textoSaudacao, { color: cores.textSecondary }]}>
              {saudacaoUsuario}
            </Text>
            <Text style={[styles.tituloPrincipal, { color: cores.text }]}>
              Guia Parnanguara
            </Text>
          </View>
          <SimboloLitoraneo tamanho={52} />
        </View>

        <View
          style={[
            styles.barraBusca,
            {
              backgroundColor: cores.backgroundElement,
              borderColor: cores.backgroundSelected,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={cores.textSecondary}
          />
          <TextInput
            style={[styles.inputBusca, { color: cores.text }]}
            placeholder="Buscar atrações..."
            placeholderTextColor={cores.textSecondary}
            value={termoBusca}
            onChangeText={setTermoBusca}
            clearButtonMode="while-editing"
          />
          {termoBusca.length > 0 && (
            <TouchableOpacity
              onPress={() => setTermoBusca('')}
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={cores.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mascoteComFiltros}>
          <View style={styles.containerMascote}>
            <MascoteCaranguejo tamanho={88} />
          </View>

          {categorias.length > 0 && (
            <View style={styles.secaoCategorias}>
              <Text style={styles.tituloFiltros}>Explore por categoria</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listaCategorias}
              >
                <TouchableOpacity
                  style={[
                    styles.chipCategoria,
                    categoriaSelecionadaId === null
                      ? styles.chipCategoriaAtivo
                      : {
                          backgroundColor: cores.backgroundElement,
                          borderColor: cores.backgroundSelected,
                        },
                  ]}
                  onPress={() => setCategoriaSelecionadaId(null)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: categoriaSelecionadaId === null }}
                >
                  <Text
                    style={[
                      styles.textoChipCategoria,
                      categoriaSelecionadaId === null
                        ? styles.textoChipCategoriaAtivo
                        : { color: cores.text },
                    ]}
                  >
                    Todos
                  </Text>
                </TouchableOpacity>

                {categorias.map((categoria) => {
                  const estaAtiva = categoriaSelecionadaId === categoria.id;
                  return (
                    <TouchableOpacity
                      key={categoria.id}
                      style={[
                        styles.chipCategoria,
                        estaAtiva
                          ? styles.chipCategoriaAtivo
                          : {
                              backgroundColor: cores.backgroundElement,
                              borderColor: cores.backgroundSelected,
                            },
                      ]}
                      onPress={() =>
                        setCategoriaSelecionadaId(
                          estaAtiva ? null : categoria.id
                        )
                      }
                      accessibilityRole="button"
                      accessibilityState={{ selected: estaAtiva }}
                    >
                      <Text
                        style={[
                          styles.textoChipCategoria,
                          estaAtiva
                            ? styles.textoChipCategoriaAtivo
                            : { color: cores.text },
                        ]}
                      >
                        {categoria.titulo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

        </View>

        {/* Alerta de erro de conexao com botao de tentar novamente */}
        {mensagemErro && (
          <View style={styles.bannerErro}>
            <Ionicons name="alert-circle-outline" size={20} color={cores.perigo} />
            <Text style={styles.textoErro}>{mensagemErro}</Text>
            <TouchableOpacity
              onPress={lidarComAtualizacao}
              style={styles.botaoTentarNovamente}
              accessibilityRole="button"
            >
              <Text style={styles.textoBotaoTentarNovamente}>Recarregar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seção de Pontos em Destaque (Carrossel com DestaqueCard existente) */}
        {!termoBusca && categoriaSelecionadaId === null && locaisDestaque.length > 0 && (
          <View style={styles.secao}>
            <View style={styles.cabecalhoSecao}>
              <Text style={[styles.tituloSecao, { color: cores.text }]}>
                Destaques de Paranaguá
              </Text>
              <Text
                style={[styles.contadorSecao, { color: cores.textSecondary }]}
              >
                {locaisDestaque.length} locais
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carrosselDestaques}
            >
              {locaisDestaque.map((local) => {
                const imagemCapa =
                  local.imagens.find((item) => item.imagem_capa) ||
                  local.imagens[0];
                const urlImagem = resolverUrlImagem(imagemCapa?.imagem_url);
                const categoriaTitulo = local.categorias[0]?.titulo;

                return (
                  <DestaqueCard
                    key={`destaque-${local.id}`}
                    name={local.nome}
                    subtitle={local.endereco}
                    category={categoriaTitulo}
                    image={urlImagem ? { uri: urlImagem } : IMAGEM_PADRAO}
                    onPress={() => abrirDetalhes(local)}
                    style={styles.cardDestaqueItem}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Seção de Eventos */}
        {eventosFiltrados.length > 0 && (
          <View style={styles.secao}>
            <View style={styles.cabecalhoSecao}>
              <Text style={[styles.tituloSecao, { color: cores.text }]}>
                Próximos Eventos
              </Text>
              <Text
                style={[styles.contadorSecao, { color: cores.textSecondary }]}
              >
                {eventosFiltrados.length}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carrosselEventos}
            >
              {eventosFiltrados.map((evento) => (
                <EventoCard
                  key={`evento-${evento.id}`}
                  evento={evento}
                  aoPressionar={() => abrirDetalhes(evento)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Seção de Todos os Locais */}
        <View style={styles.secao}>
          <View style={styles.cabecalhoSecao}>
            <Text style={[styles.tituloSecao, { color: cores.text }]}>
              {termoBusca || categoriaSelecionadaId !== null
                ? 'Resultados da busca'
                : 'Pontos Turísticos'}
            </Text>
            <Text
              style={[styles.contadorSecao, { color: cores.textSecondary }]}
            >
              {locaisFiltrados.length} locais
            </Text>
          </View>

          {locaisFiltrados.length === 0 ? (
            <View
              style={[
                styles.estadoVazio,
                { backgroundColor: cores.backgroundElement },
              ]}
            >
              <Ionicons
                name="map-outline"
                size={40}
                color={cores.textSecondary}
              />
              <Text
                style={[
                  styles.tituloEstadoVazio,
                  { color: cores.textSecondary },
                ]}
              >
                Nenhum local encontrado
              </Text>
              <Text
                style={[
                  styles.descricaoEstadoVazio,
                  { color: cores.textSecondary },
                ]}
              >
                Tente ajustar os filtros ou pesquisar por outro termo.
              </Text>
            </View>
          ) : (
            locaisFiltrados.map((local) => (
              <LocalCard
                key={`local-${local.id}`}
                local={local}
                aoPressionar={() => abrirDetalhes(local)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal de Detalhes Completo */}
      <DetalheAtrativoModal
        visivel={modalDetalhesVisivel}
        atrativo={atrativoSelecionado}
        aoFechar={fecharDetalhes}
      />
    </SafeAreaView>
  );
}

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  containerSeguro: {
    flex: 1,
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  textoCarregando: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  textoSaudacao: {
    fontSize: 14,
    fontWeight: '500',
  },
  tituloPrincipal: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  conviteLitoral: { backgroundColor: cores.destaque, overflow: 'hidden', marginBottom: 24 },
  solDecorativo: { position: 'absolute', right: -32, top: -24, width: 150, height: 150, borderRadius: 75, backgroundColor: '#D9A45B', opacity: 0.14 },
  sobretituloLitoral: { color: '#F2C27C', fontSize: 10, letterSpacing: 1.7, fontWeight: '700', marginBottom: 16 },
  apresentacaoMascote: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tituloLitoral: { flex: 1, color: cores.sobreDestaque, fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.8 },
  descricaoLitoral: { color: cores.detalheDestaque, fontSize: 14, lineHeight: 22, marginTop: 12, maxWidth: 320 },
  localizacaoLitoral: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 },
  textoLocalizacao: { color: cores.detalheDestaque, fontSize: 12, fontWeight: '500' },
  barraBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 16,
    gap: 10,
  },
  inputBusca: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  bannerErro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.perigoSuave,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  textoErro: {
    color: cores.perigo,
    fontSize: 13,
    flex: 1,
  },
  botaoTentarNovamente: {
    backgroundColor: '#B33E35',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  textoBotaoTentarNovamente: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mascoteComFiltros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    marginBottom: 24,
  },
  containerMascote: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  secaoCategorias: {
    flex: 1,
    minWidth: 0,
  },
  tituloFiltros: {
    color: cores.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  listaCategorias: {
    alignItems: 'center',
    gap: 6,
    paddingRight: 12,
  },
  chipCategoria: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 34,
    flexShrink: 0,
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 1,
  },
  chipCategoriaAtivo: {
    backgroundColor: cores.acao,
    borderColor: cores.acao,
  },
  textoChipCategoria: {
    fontSize: 12,
    fontWeight: '600',
  },
  textoChipCategoriaAtivo: {
    color: '#FFFFFF',
  },
  secao: {
    marginBottom: 24,
  },
  cabecalhoSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  contadorSecao: {
    fontSize: 13,
  },
  carrosselDestaques: {
    paddingRight: 8,
    gap: 14,
  },
  cardDestaqueItem: {
    marginRight: 0,
  },
  carrosselEventos: {
    paddingRight: 8,
  },
  estadoVazio: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloEstadoVazio: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  descricaoEstadoVazio: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});
