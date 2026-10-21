import { MascoteCaranguejo } from '@/components/identidade/MascoteCaranguejo';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Modal, RefreshControl, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { DetalheRotaModal } from '@/components/rotas/DetalheRotaModal';
import { FormularioRotaModal } from '@/components/rotas/FormularioRotaModal';
import { RoteiroManualModal } from '@/components/rotas/RoteiroManualModal';
import { GerarRoteiroModal } from '@/components/rotas/GerarRoteiroModal';
import { criarRotaManual, gerarRota, listarRotas, removerRota, renomearRota } from '@/services/rotasService';
import { Rota, SolicitacaoGeracaoRota } from '@/types/rota';
import { CoresTema } from '@/utils/theme';
import { useTema } from '@/contexts/TemaContext';

export default function TelaRotas() {
  const { cores } = useTema();
  const estilos = criarEstilos(cores);
  const { tokenAcesso, sairDaConta } = useAutenticacao();
  const [rotas, definirRotas] = useState<Rota[]>([]);
  const [estaCarregando, definirEstaCarregando] = useState(true);
  const [estaAtualizando, definirEstaAtualizando] = useState(false);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [tentativaCarregamento, definirTentativaCarregamento] = useState(0);
  const [rotaSelecionadaId, definirRotaSelecionadaId] = useState<number | null>(null);
  const [formularioVisivel, definirFormularioVisivel] = useState(false);
  const [roteiroManualVisivel, definirRoteiroManualVisivel] = useState(false);
  const [geracaoVisivel, definirGeracaoVisivel] = useState(false);
  const [rotaEmEdicao, definirRotaEmEdicao] = useState<Rota | null>(null);
  const [rotaParaExcluir, definirRotaParaExcluir] = useState<Rota | null>(null);
  const [estaExcluindo, definirEstaExcluindo] = useState(false);
  const [erroExclusao, definirErroExclusao] = useState<string | null>(null);
  const versaoLista = useRef(0);

  useEffect(() => {
    let estaMontado = true;
    const versaoRequisicao = ++versaoLista.current;
    async function carregarRotas() {
      if (!tokenAcesso) {
        definirRotas([]);
        definirEstaCarregando(false);
        return;
      }
      definirMensagemErro(null);
      try {
        const rotasRecebidas = await listarRotas(tokenAcesso);
        // Uma atualização antiga não deve desfazer uma criação ou exclusão recente.
        if (estaMontado && versaoRequisicao === versaoLista.current) {
          definirRotas(rotasRecebidas);
        }
      } catch {
        if (estaMontado && versaoRequisicao === versaoLista.current) {
          definirMensagemErro('Não foi possível carregar seus roteiros. Verifique a conexão e se sua sessão ainda está válida.');
        }
      } finally {
        if (estaMontado) {
          definirEstaCarregando(false);
          definirEstaAtualizando(false);
        }
      }
    }
    carregarRotas();
    return () => { estaMontado = false; };
  }, [tokenAcesso, tentativaCarregamento]);

  const atualizarRotas = useCallback(() => {
    definirEstaAtualizando(true);
    definirTentativaCarregamento((tentativa) => tentativa + 1);
  }, []);

  function abrirCriacaoRota() {
    definirRoteiroManualVisivel(true);
  }

  function abrirEdicaoRota(rota: Rota) {
    definirRotaEmEdicao(rota);
    definirFormularioVisivel(true);
  }

  async function salvarRota(titulo: string) {
    if (!tokenAcesso) throw new Error('Entre na sua conta para salvar roteiros.');
    if (!rotaEmEdicao) return;
    const rotaSalva = await renomearRota(rotaEmEdicao.id, titulo, tokenAcesso);
    versaoLista.current += 1;
    definirRotas((rotasAtuais) => rotaEmEdicao
      ? rotasAtuais.map((rota) => rota.id === rotaSalva.id ? rotaSalva : rota)
      : [rotaSalva, ...rotasAtuais]);
    definirMensagemErro(null);
    definirFormularioVisivel(false);
    definirTentativaCarregamento((tentativa) => tentativa + 1);
  }

  async function salvarRotaManual(titulo: string, atrativoIds: number[]) {
    if (!tokenAcesso) throw new Error('Entre na sua conta para salvar roteiros.');
    const rotaSalva = await criarRotaManual(titulo, atrativoIds, tokenAcesso);
    versaoLista.current += 1;
    definirRotas((rotasAtuais) => [rotaSalva, ...rotasAtuais]);
    definirMensagemErro(null);
    definirRoteiroManualVisivel(false);
    definirRotaSelecionadaId(rotaSalva.id);
    definirTentativaCarregamento((tentativa) => tentativa + 1);
  }

  async function gerarRoteiroAutomatico(solicitacao: SolicitacaoGeracaoRota) {
    if (!tokenAcesso) throw new Error('Entre na sua conta para gerar roteiros.');
    const rotaGerada = await gerarRota(solicitacao, tokenAcesso);
    versaoLista.current += 1;
    definirRotas((rotasAtuais) => [rotaGerada, ...rotasAtuais]);
    definirMensagemErro(null);
    definirGeracaoVisivel(false);
    definirRotaSelecionadaId(rotaGerada.id);
    definirTentativaCarregamento((tentativa) => tentativa + 1);
  }

  async function excluirRota() {
    if (!rotaParaExcluir || !tokenAcesso || estaExcluindo) return;
    definirEstaExcluindo(true);
    definirErroExclusao(null);
    try {
      await removerRota(rotaParaExcluir.id, tokenAcesso);
      versaoLista.current += 1;
      definirRotas((rotasAtuais) => rotasAtuais.filter((rota) => rota.id !== rotaParaExcluir.id));
      definirMensagemErro(null);
      definirRotaParaExcluir(null);
      definirTentativaCarregamento((tentativa) => tentativa + 1);
    } catch {
      definirErroExclusao('Não foi possível excluir o roteiro. Tente novamente.');
    } finally {
      definirEstaExcluindo(false);
    }
  }

  async function abrirLogin() {
    try {
      await sairDaConta();
    } catch {
      definirMensagemErro('Não foi possível abrir o login. Tente novamente.');
    }
  }

  if (!tokenAcesso) {
    return (
      <SafeAreaView style={[estilos.tela, { backgroundColor: cores.background }]} edges={['top']}>
        <View style={estilos.estadoVisitante}>
          <MascoteCaranguejo pose="mapa" tamanho={152} />
          <Text style={[estilos.titulo, { color: cores.text }]}>Seus passeios, do seu jeito</Text>
          <Text style={[estilos.descricao, { color: cores.textSecondary }]}>
            Entre na sua conta para criar roteiros e consultar suas paradas em Paranaguá.
          </Text>
          {mensagemErro && <Text style={estilos.textoErro} accessibilityRole="alert">{mensagemErro}</Text>}
          <TouchableOpacity onPress={abrirLogin} style={estilos.botaoPrincipal} accessibilityRole="button">
            <Text style={estilos.textoBotaoPrincipal}>Entrar ou cadastrar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: cores.background }]} edges={['top']}>
      <FlatList
        data={rotas}
        keyExtractor={(rota) => String(rota.id)}
        contentContainerStyle={estilos.lista}
        refreshControl={<RefreshControl
          refreshing={estaAtualizando}
          onRefresh={atualizarRotas}
          colors={[cores.principal]}
          tintColor={cores.principal}
        />}
        ListHeaderComponent={
          <View style={estilos.cabecalho}>
            <Text style={[estilos.titulo, { color: cores.text }]} accessibilityRole="header">Minhas Rotas</Text>
            <Text style={[estilos.descricao, { color: cores.textSecondary }]}>
              Organize seus próximos passeios por Paranaguá.
            </Text>
            <TouchableOpacity onPress={() => definirGeracaoVisivel(true)} style={estilos.botaoPrincipal} accessibilityRole="button">
              <Ionicons name="sparkles-outline" size={22} color="#FFFFFF" />
              <Text style={estilos.textoBotaoPrincipal}>Gerar roteiro para mim</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={abrirCriacaoRota} style={estilos.botaoPrincipal} accessibilityRole="button">
              <Ionicons name="add" size={22} color="#FFFFFF" />
              <Text style={estilos.textoBotaoPrincipal}>Montar roteiro manual</Text>
            </TouchableOpacity>
            {mensagemErro && (
              <View style={estilos.avisoErro}>
                <Text style={estilos.textoErro} accessibilityRole="alert">{mensagemErro}</Text>
                <TouchableOpacity onPress={atualizarRotas} accessibilityRole="button" style={estilos.botaoAcao}>
                  <Text style={estilos.textoAcao}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={estaCarregando ? (
          <ActivityIndicator size="large" color={cores.principal} accessibilityLabel="Carregando roteiros" />
        ) : !mensagemErro ? (
          <View style={[estilos.estadoVazio, { backgroundColor: cores.backgroundElement }]}>
            <MascoteCaranguejo pose="mapa" tamanho={112} />
            <Text style={[estilos.nomeRota, { color: cores.text }]}>Seu próximo passeio começa aqui</Text>
            <Text style={[estilos.descricao, { color: cores.textSecondary }]}>Crie seu primeiro roteiro para organizar a visita.</Text>
          </View>
        ) : null}
        renderItem={({ item: rota }) => (
          <View style={[estilos.cardRota, { borderColor: cores.backgroundSelected }]}>
            <TouchableOpacity
              onPress={() => definirRotaSelecionadaId(rota.id)}
              style={estilos.resumoRota}
              accessibilityRole="button"
              accessibilityLabel={`Abrir roteiro ${rota.titulo}`}
            >
              <Ionicons name="map-outline" size={32} color={cores.principal} />
              <View style={estilos.textosRota}>
                <Text style={[estilos.nomeRota, { color: cores.text }]}>{rota.titulo}</Text>
                <Text style={[estilos.descricao, { color: cores.textSecondary }]}>
                  {rota.itens.length === 1 ? '1 parada' : `${rota.itens.length} paradas`}
                  {rota.duracao_estimada_minutos != null ? ` · ${rota.duracao_estimada_minutos} min estimados` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={cores.textSecondary} />
            </TouchableOpacity>
            <View style={estilos.acoesRota}>
              <TouchableOpacity
                onPress={() => abrirEdicaoRota(rota)}
                style={estilos.botaoAcao}
                accessibilityRole="button"
                accessibilityLabel={`Renomear roteiro ${rota.titulo}`}
              ><Text style={estilos.textoAcao}>Renomear</Text></TouchableOpacity>
              <TouchableOpacity
                onPress={() => { definirErroExclusao(null); definirRotaParaExcluir(rota); }}
                style={estilos.botaoAcao}
                accessibilityRole="button"
                accessibilityLabel={`Excluir roteiro ${rota.titulo}`}
              ><Text style={estilos.textoErro}>Excluir</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
      {geracaoVisivel && <GerarRoteiroModal
        tokenAcesso={tokenAcesso}
        aoGerar={gerarRoteiroAutomatico}
        aoFechar={() => definirGeracaoVisivel(false)}
      />}
      {roteiroManualVisivel && <RoteiroManualModal
        aoSalvar={salvarRotaManual}
        aoFechar={() => definirRoteiroManualVisivel(false)}
      />}
      {formularioVisivel && <FormularioRotaModal
        tituloInicial={rotaEmEdicao?.titulo ?? ''}
        tituloFormulario={rotaEmEdicao ? 'Renomear roteiro' : 'Criar roteiro'}
        aoSalvar={salvarRota}
        aoFechar={() => definirFormularioVisivel(false)}
      />}
      {rotaSelecionadaId !== null && <DetalheRotaModal
        rotaId={rotaSelecionadaId}
        tokenAcesso={tokenAcesso}
        aoFechar={() => definirRotaSelecionadaId(null)}
      />}
      <Modal
        visible={rotaParaExcluir !== null}
        transparent
        animationType="fade"
        onRequestClose={() => { if (!estaExcluindo) definirRotaParaExcluir(null); }}
      >
        <View style={estilos.fundoModal}>
          <View style={[estilos.confirmacao, { backgroundColor: cores.background }]}>
            <Text style={[estilos.nomeRota, { color: cores.text }]} accessibilityRole="header">Excluir roteiro?</Text>
            <Text style={[estilos.descricao, { color: cores.textSecondary }]}>
              O roteiro “{rotaParaExcluir?.titulo}” será excluído. Esta ação não pode ser desfeita.
            </Text>
            {erroExclusao && <Text style={estilos.textoErro} accessibilityRole="alert">{erroExclusao}</Text>}
            <View style={estilos.acoesRota}>
              <TouchableOpacity
                disabled={estaExcluindo}
                onPress={() => definirRotaParaExcluir(null)}
                style={estilos.botaoAcao}
                accessibilityRole="button"
              ><Text style={{ color: cores.textSecondary }}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity
                disabled={estaExcluindo}
                onPress={excluirRota}
                style={estilos.botaoAcao}
                accessibilityRole="button"
                accessibilityLabel="Confirmar exclusão do roteiro"
                accessibilityState={{ disabled: estaExcluindo, busy: estaExcluindo }}
              >{estaExcluindo ? <ActivityIndicator color={cores.perigo} /> :
                <Text style={estilos.textoErro}>Excluir roteiro</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  tela: { flex: 1 },
  lista: { flexGrow: 1, padding: 20, paddingBottom: 32, width: '100%', maxWidth: 800, alignSelf: 'center' },
  cabecalho: { marginTop: 12, marginBottom: 24 },
  titulo: { fontSize: 28, fontWeight: '800' },
  descricao: { fontSize: 15, lineHeight: 23, marginTop: 8 },
  botaoPrincipal: { backgroundColor: cores.acao, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  textoBotaoPrincipal: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  estadoVisitante: { flex: 1, padding: 32, justifyContent: 'center', gap: 12, maxWidth: 560, alignSelf: 'center' },
  estadoVazio: { padding: 28, borderRadius: 18, gap: 12 },
  cardRota: { borderWidth: 1, borderRadius: 18, marginBottom: 16 },
  resumoRota: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  textosRota: { flex: 1 },
  nomeRota: { fontSize: 20, fontWeight: '700' },
  acoesRota: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 8, paddingBottom: 8 },
  botaoAcao: { padding: 14 },
  textoAcao: { color: cores.principal, fontWeight: '700' },
  textoErro: { color: cores.perigo, lineHeight: 21 },
  avisoErro: { backgroundColor: cores.perigoSuave, padding: 16, borderRadius: 12, marginTop: 20 },
  fundoModal: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: 24, justifyContent: 'center' },
  confirmacao: { padding: 24, borderRadius: 20, maxWidth: 480, width: '100%', alignSelf: 'center', gap: 12 },
});
