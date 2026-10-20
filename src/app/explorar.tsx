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
import { verificarSeEstaAberto } from '@/utils/formatadores';

type TipoAtrativoFiltro = 'todos' | 'locais' | 'eventos';

export default function TelaExplorar() {
  const { cores } = useTema();
  const styles = criarEstilos(cores);

  const [locais, setLocais] = useState<Local[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);

  const [termoBusca, setTermoBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoAtrativoFiltro>('todos');
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<
    number | null
  >(null);
  const [apenasAbertosAgora, setApenasAbertosAgora] = useState(false);
  const [apenasGratuitos, setApenasGratuitos] = useState(false);

  const [estaCarregando, setEstaCarregando] = useState(true);
  const [estaAtualizando, setEstaAtualizando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const [atrativoSelecionado, setAtrativoSelecionado] = useState<
    Local | Evento | null
  >(null);
  const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);

  const carregarDadosExplorar = useCallback(async () => {
    try {
      setMensagemErro(null);

      const [resultadoCategorias, resultadoLocais, resultadoEventos] =
        await Promise.allSettled([
          listarCategorias(),
          listarLocais(),
          listarEventos(),
        ]);

      if (resultadoCategorias.status === 'fulfilled') {
        setCategorias(
          resultadoCategorias.value.filter((categoria) => categoria.ativo)
        );
      }

      if (resultadoLocais.status === 'fulfilled') {
        setLocais(resultadoLocais.value.filter((local) => local.ativo));
      }

      if (resultadoEventos.status === 'fulfilled') {
        setEventos(resultadoEventos.value.filter((evento) => evento.ativo));
      }

      if (
        resultadoCategorias.status === 'rejected' &&
        resultadoLocais.status === 'rejected' &&
        resultadoEventos.status === 'rejected'
      ) {
        setMensagemErro(
          'Não foi possível carregar os atrativos. Verifique a conexão com o servidor.'
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
    carregarDadosExplorar();
  }, [carregarDadosExplorar]);

  async function lidarComAtualizacao() {
    setEstaAtualizando(true);
    await carregarDadosExplorar();
  }

  function abrirDetalhes(atrativo: Local | Evento) {
    setAtrativoSelecionado(atrativo);
    setModalDetalhesVisivel(true);
  }

  function fecharDetalhes() {
    setModalDetalhesVisivel(false);
    setAtrativoSelecionado(null);
  }

  function limparFiltros() {
    setTermoBusca('');
    setTipoFiltro('todos');
    setCategoriaSelecionadaId(null);
    setApenasAbertosAgora(false);
    setApenasGratuitos(false);
  }

  // Filtragem dos locais
  const locaisFiltrados = useMemo(() => {
    if (tipoFiltro === 'eventos') {
      return [];
    }

    return locais.filter((local) => {
      const termo = termoBusca.trim().toLowerCase();
      const atendeBusca = termo
        ? local.nome.toLowerCase().includes(termo) ||
          local.endereco.toLowerCase().includes(termo) ||
          local.descricao.toLowerCase().includes(termo)
        : true;

      const atendeCategoria =
        categoriaSelecionadaId !== null
          ? local.categorias.some(
              (categoria) => categoria.id === categoriaSelecionadaId
            )
          : true;

      const atendeAberto = apenasAbertosAgora
        ? verificarSeEstaAberto(
            local.horario_abertura,
            local.horario_fechamento
          )
        : true;

      const atendeGratuito = apenasGratuitos
        ? local.valor_entrada === null ||
          local.valor_entrada === undefined ||
          Number(local.valor_entrada) === 0
        : true;

      return atendeBusca && atendeCategoria && atendeAberto && atendeGratuito;
    });
  }, [
    locais,
    termoBusca,
    tipoFiltro,
    categoriaSelecionadaId,
    apenasAbertosAgora,
    apenasGratuitos,
  ]);

  // Filtragem dos eventos
  const eventosFiltrados = useMemo(() => {
    if (tipoFiltro === 'locais' || apenasAbertosAgora) {
      return [];
    }

    return eventos.filter((evento) => {
      const termo = termoBusca.trim().toLowerCase();
      const atendeBusca = termo
        ? evento.nome.toLowerCase().includes(termo) ||
          evento.endereco.toLowerCase().includes(termo) ||
          evento.descricao.toLowerCase().includes(termo)
        : true;

      const atendeCategoria =
        categoriaSelecionadaId !== null
          ? evento.categorias.some(
              (categoria) => categoria.id === categoriaSelecionadaId
            )
          : true;

      const atendeGratuito = apenasGratuitos
        ? evento.valor_entrada === null ||
          evento.valor_entrada === undefined ||
          Number(evento.valor_entrada) === 0
        : true;

      return atendeBusca && atendeCategoria && atendeGratuito;
    });
  }, [
    eventos,
    termoBusca,
    tipoFiltro,
    categoriaSelecionadaId,
    apenasAbertosAgora,
    apenasGratuitos,
  ]);

  const totalResultados = locaisFiltrados.length + eventosFiltrados.length;
  const temFiltroAtivo =
    termoBusca.trim() !== '' ||
    tipoFiltro !== 'todos' ||
    categoriaSelecionadaId !== null ||
    apenasAbertosAgora ||
    apenasGratuitos;

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
          Carregando catálogo de atrativos...
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
        {/* Cabecalho da aba */}
        <View style={styles.cabecalho}>
          <Text style={[styles.tituloPrincipal, { color: cores.text }]}>
            Explorar
          </Text>
          <Text style={[styles.subtitulo, { color: cores.textSecondary }]}>
            Descubra pontos turísticos, história e eventos em Paranaguá
          </Text>
        </View>

        {/* Barra de Pesquisa */}
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
            placeholder="Buscar por nome, bairro ou descrição..."
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

        {/* Filtro por Tipo de Atrativo (Tabs Segmentadas) */}
        <View
          style={[
            styles.containerAbasTipo,
            { backgroundColor: cores.backgroundElement },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.abaTipoItem,
              tipoFiltro === 'todos' && [
                styles.abaTipoItemAtiva,
                { backgroundColor: cores.background },
              ],
            ]}
            onPress={() => setTipoFiltro('todos')}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.textoAbaTipo,
                {
                  color:
                    tipoFiltro === 'todos' ? cores.principal : cores.textSecondary,
                  fontWeight: tipoFiltro === 'todos' ? '700' : '500',
                },
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.abaTipoItem,
              tipoFiltro === 'locais' && [
                styles.abaTipoItemAtiva,
                { backgroundColor: cores.background },
              ],
            ]}
            onPress={() => setTipoFiltro('locais')}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.textoAbaTipo,
                {
                  color:
                    tipoFiltro === 'locais' ? cores.principal : cores.textSecondary,
                  fontWeight: tipoFiltro === 'locais' ? '700' : '500',
                },
              ]}
            >
              Locais ({locais.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.abaTipoItem,
              tipoFiltro === 'eventos' && [
                styles.abaTipoItemAtiva,
                { backgroundColor: cores.background },
              ],
            ]}
            onPress={() => setTipoFiltro('eventos')}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.textoAbaTipo,
                {
                  color:
                    tipoFiltro === 'eventos' ? cores.principal : cores.textSecondary,
                  fontWeight: tipoFiltro === 'eventos' ? '700' : '500',
                },
              ]}
            >
              Eventos ({eventos.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtros Rápidos Extras (Aberto Agora / Gratuito) */}
        <View style={styles.linhaFiltrosRapidos}>
          <TouchableOpacity
            style={[
              styles.chipRapido,
              apenasAbertosAgora
                ? styles.chipRapidoAtivo
                : {
                    backgroundColor: cores.backgroundElement,
                    borderColor: cores.backgroundSelected,
                  },
            ]}
            onPress={() => setApenasAbertosAgora(!apenasAbertosAgora)}
            accessibilityRole="button"
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={apenasAbertosAgora ? '#FFFFFF' : cores.textSecondary}
            />
            <Text
              style={[
                styles.textoChipRapido,
                apenasAbertosAgora
                  ? styles.textoChipRapidoAtivo
                  : { color: cores.text },
              ]}
            >
              Aberto agora
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chipRapido,
              apenasGratuitos
                ? styles.chipRapidoAtivo
                : {
                    backgroundColor: cores.backgroundElement,
                    borderColor: cores.backgroundSelected,
                  },
            ]}
            onPress={() => setApenasGratuitos(!apenasGratuitos)}
            accessibilityRole="button"
          >
            <Ionicons
              name="pricetag-outline"
              size={14}
              color={apenasGratuitos ? '#FFFFFF' : cores.textSecondary}
            />
            <Text
              style={[
                styles.textoChipRapido,
                apenasGratuitos
                  ? styles.textoChipRapidoAtivo
                  : { color: cores.text },
              ]}
            >
              Entrada gratuita
            </Text>
          </TouchableOpacity>

          {temFiltroAtivo && (
            <TouchableOpacity
              style={styles.botaoLimparFiltrosMini}
              onPress={limparFiltros}
              accessibilityRole="button"
            >
              <Text style={styles.textoLimparFiltrosMini}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Carrossel de Categorias */}
        {categorias.length > 0 && (
          <View style={styles.secaoCategorias}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listaCategoriasHorizontal}
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
              >
                <Text
                  style={[
                    styles.textoChipCategoria,
                    categoriaSelecionadaId === null
                      ? styles.textoChipCategoriaAtivo
                      : { color: cores.text },
                  ]}
                >
                  Todas
                </Text>
              </TouchableOpacity>

              {categorias.map((categoria) => {
                const estaAtiva = categoriaSelecionadaId === categoria.id;
                return (
                  <TouchableOpacity
                    key={`cat-${categoria.id}`}
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

        {/* Mensagem de Erro de Conexão */}
        {mensagemErro && (
          <View style={styles.bannerErro}>
            <Ionicons name="alert-circle-outline" size={20} color={cores.perigo} />
            <Text style={styles.textoErro}>{mensagemErro}</Text>
            <TouchableOpacity
              onPress={lidarComAtualizacao}
              style={styles.botaoRecarregar}
              accessibilityRole="button"
            >
              <Text style={styles.textoBotaoRecarregar}>Recarregar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Indicador de Quantidade */}
        <View style={styles.barraContador}>
          <Text style={[styles.textoContador, { color: cores.textSecondary }]}>
            {totalResultados === 1
              ? '1 atrativo encontrado'
              : `${totalResultados} atrativos encontrados`}
          </Text>
        </View>

        {/* Estado Vazio */}
        {totalResultados === 0 ? (
          <View
            style={[
              styles.estadoVazio,
              { backgroundColor: cores.backgroundElement },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={48}
              color={cores.textSecondary}
            />
            <Text
              style={[styles.tituloEstadoVazio, { color: cores.text }]}
            >
              Nenhum atrativo encontrado
            </Text>
            <Text
              style={[
                styles.descricaoEstadoVazio,
                { color: cores.textSecondary },
              ]}
            >
              Não encontramos resultados com os filtros atuais.
            </Text>
            {temFiltroAtivo && (
              <TouchableOpacity
                style={styles.botaoResetarFiltros}
                onPress={limparFiltros}
                accessibilityRole="button"
              >
                <Text style={styles.textoBotaoResetarFiltros}>
                  Limpar todos os filtros
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.listaResultados}>
            {/* Eventos primeiro caso estejam filtrados */}
            {eventosFiltrados.length > 0 && tipoFiltro !== 'locais' && (
              <View style={styles.blocoEventos}>
                <Text
                  style={[styles.tituloSubSecao, { color: cores.text }]}
                >
                  Eventos ({eventosFiltrados.length})
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carrosselEventosExplorar}
                >
                  {eventosFiltrados.map((evento) => (
                    <EventoCard
                      key={`evento-explorar-${evento.id}`}
                      evento={evento}
                      aoPressionar={() => abrirDetalhes(evento)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Lista Vertical de Locais */}
            {locaisFiltrados.length > 0 && tipoFiltro !== 'eventos' && (
              <View style={styles.blocoLocais}>
                {eventosFiltrados.length > 0 && tipoFiltro === 'todos' && (
                  <Text
                    style={[styles.tituloSubSecao, { color: cores.text }]}
                  >
                    Locais ({locaisFiltrados.length})
                  </Text>
                )}
                {locaisFiltrados.map((local) => (
                  <LocalCard
                    key={`local-explorar-${local.id}`}
                    local={local}
                    aoPressionar={() => abrirDetalhes(local)}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal de Detalhes */}
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
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  cabecalho: {
    marginTop: 12,
    marginBottom: 16,
  },
  tituloPrincipal: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 19,
  },
  barraBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    gap: 10,
  },
  inputBusca: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  containerAbasTipo: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  abaTipoItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  abaTipoItemAtiva: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoAbaTipo: {
    fontSize: 13,
  },
  linhaFiltrosRapidos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  chipRapido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipRapidoAtivo: {
    backgroundColor: cores.acao,
    borderColor: cores.acao,
  },
  textoChipRapido: {
    fontSize: 12,
    fontWeight: '600',
  },
  textoChipRapidoAtivo: {
    color: '#FFFFFF',
  },
  botaoLimparFiltrosMini: {
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  textoLimparFiltrosMini: {
    color: cores.perigo,
    fontSize: 12,
    fontWeight: '600',
  },
  secaoCategorias: {
    marginBottom: 16,
  },
  listaCategoriasHorizontal: {
    gap: 8,
    paddingRight: 8,
  },
  chipCategoria: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipCategoriaAtivo: {
    backgroundColor: cores.acao,
    borderColor: cores.acao,
  },
  textoChipCategoria: {
    fontSize: 13,
    fontWeight: '600',
  },
  textoChipCategoriaAtivo: {
    color: '#FFFFFF',
  },
  barraContador: {
    marginBottom: 12,
  },
  textoContador: {
    fontSize: 13,
    fontWeight: '500',
  },
  bannerErro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.perigoSuave,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  textoErro: {
    color: cores.perigo,
    fontSize: 13,
    flex: 1,
  },
  botaoRecarregar: {
    backgroundColor: '#B33E35',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  textoBotaoRecarregar: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listaResultados: {
    gap: 4,
  },
  blocoEventos: {
    marginBottom: 18,
  },
  tituloSubSecao: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  carrosselEventosExplorar: {
    paddingRight: 8,
  },
  blocoLocais: {
    marginTop: 2,
  },
  estadoVazio: {
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  tituloEstadoVazio: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  descricaoEstadoVazio: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  botaoResetarFiltros: {
    marginTop: 16,
    backgroundColor: cores.acao,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  textoBotaoResetarFiltros: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});