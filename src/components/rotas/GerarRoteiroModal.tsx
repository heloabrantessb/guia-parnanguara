import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, useColorScheme, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listarCategorias } from '@/services/categoriasService';
import { buscarPreferencias, salvarPreferencias } from '@/services/preferenciasService';
import { Categoria } from '@/types/categoria';
import { SolicitacaoGeracaoRota } from '@/types/rota';
import { Colors } from '@/utils/theme';

interface GerarRoteiroModalProps {
  tokenAcesso: string;
  aoGerar: (solicitacao: SolicitacaoGeracaoRota) => Promise<void>;
  aoFechar: () => void;
}

export function GerarRoteiroModal({ tokenAcesso, aoGerar, aoFechar }: GerarRoteiroModalProps) {
  const esquemaCores = useColorScheme();
  const cores = Colors[esquemaCores === 'dark' ? 'dark' : 'light'];
  const [titulo, definirTitulo] = useState('');
  const [tempoDisponivel, definirTempoDisponivel] = useState('120');
  const [categorias, definirCategorias] = useState<Categoria[]>([]);
  const [categoriaIds, definirCategoriaIds] = useState<number[]>([]);
  const [estaCarregando, definirEstaCarregando] = useState(true);
  const [estaGerando, definirEstaGerando] = useState(false);
  const [estaSalvandoPreferencias, definirEstaSalvandoPreferencias] = useState(false);
  const [erroCarregamento, definirErroCarregamento] = useState<string | null>(null);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [mensagemPreferencias, definirMensagemPreferencias] = useState<string | null>(null);
  const [tentativaCarregamento, definirTentativaCarregamento] = useState(0);
  const envioEmAndamento = useRef(false);
  const estaOcupado = estaGerando || estaSalvandoPreferencias;

  useEffect(() => {
    let estaMontado = true;
    async function carregarPreferencias() {
      definirEstaCarregando(true);
      definirErroCarregamento(null);
      try {
        const [categoriasRecebidas, preferencias] = await Promise.all([listarCategorias(), buscarPreferencias(tokenAcesso)]);
        const categoriasAtivas = categoriasRecebidas.filter((categoria) => categoria.ativo);
        if (estaMontado) {
          definirCategorias(categoriasAtivas);
          definirCategoriaIds(preferencias.filter((categoria) => categoriasAtivas.some((ativa) => ativa.id === categoria.id)).map((categoria) => categoria.id));
        }
      } catch {
        if (estaMontado) definirErroCarregamento('Não foi possível carregar suas preferências. Verifique a conexão e sua sessão.');
      } finally {
        if (estaMontado) definirEstaCarregando(false);
      }
    }
    carregarPreferencias();
    return () => { estaMontado = false; };
  }, [tokenAcesso, tentativaCarregamento]);

  function alternarCategoria(categoriaId: number) {
    definirMensagemErro(null);
    definirMensagemPreferencias(null);
    definirCategoriaIds((idsAtuais) => idsAtuais.includes(categoriaId)
      ? idsAtuais.filter((id) => id !== categoriaId)
      : [...idsAtuais, categoriaId]);
  }

  async function salvarPreferenciasSelecionadas() {
    if (envioEmAndamento.current) return;
    envioEmAndamento.current = true;
    definirEstaSalvandoPreferencias(true);
    definirMensagemErro(null);
    definirMensagemPreferencias(null);
    try {
      await salvarPreferencias(categoriaIds, tokenAcesso);
      definirMensagemPreferencias('Preferências salvas para os próximos passeios.');
    } catch (erro) {
      definirMensagemErro(erro instanceof Error ? erro.message : 'Não foi possível salvar suas preferências.');
    } finally {
      envioEmAndamento.current = false;
      definirEstaSalvandoPreferencias(false);
    }
  }

  async function gerarRoteiroSelecionado() {
    if (envioEmAndamento.current) return;
    const minutosDisponiveis = Number(tempoDisponivel);
    if (!titulo.trim() || titulo.trim().length > 255) {
      definirMensagemErro('Informe um nome com 1 a 255 caracteres.');
      return;
    }
    if (!Number.isInteger(minutosDisponiveis) || minutosDisponiveis < 1 || minutosDisponiveis > 1440) {
      definirMensagemErro('Informe o tempo disponível de 1 a 1440 minutos.');
      return;
    }
    if (categoriaIds.length === 0 || categoriaIds.length > 100) {
      definirMensagemErro('Selecione de 1 a 100 categorias de interesse.');
      return;
    }
    envioEmAndamento.current = true;
    definirEstaGerando(true);
    definirMensagemErro(null);
    try {
      await aoGerar({ titulo: titulo.trim(), tempo_disponivel_minutos: minutosDisponiveis, categoria_ids: categoriaIds });
    } catch (erro) {
      definirMensagemErro(erro instanceof Error ? erro.message : 'Não foi possível gerar o roteiro. Tente novamente.');
      definirEstaGerando(false);
      envioEmAndamento.current = false;
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={() => { if (!envioEmAndamento.current) aoFechar(); }}>
      <SafeAreaView style={[estilos.tela, { backgroundColor: cores.background }]}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={[estilos.titulo, { color: cores.text }]} accessibilityRole="header">Gerar roteiro para mim</Text>
          <Text style={[estilos.descricao, { color: cores.textSecondary }]}>Escolha seus interesses e quanto tempo tem para passear a pé. O passeio será planejado para começar agora, na primeira parada.</Text>
          <Text style={{ color: cores.text }}>Nome do roteiro</Text>
          <TextInput value={titulo} onChangeText={definirTitulo} editable={!estaOcupado} maxLength={255}
            placeholder="Ex.: Uma tarde de cultura" placeholderTextColor={cores.textSecondary} accessibilityLabel="Nome do roteiro"
            style={[estilos.campo, { color: cores.text, borderColor: cores.backgroundSelected }]} />
          <Text style={{ color: cores.text }}>Tempo disponível em minutos</Text>
          <TextInput value={tempoDisponivel} onChangeText={definirTempoDisponivel} editable={!estaOcupado}
            keyboardType="number-pad" maxLength={4} accessibilityLabel="Tempo disponível em minutos"
            style={[estilos.campo, { color: cores.text, borderColor: cores.backgroundSelected }]} />
          <Text style={[estilos.subtitulo, { color: cores.text }]}>Seus interesses</Text>
          {estaCarregando ? <ActivityIndicator color="#0284C7" accessibilityLabel="Carregando preferências" /> : erroCarregamento ? <View>
            <Text style={estilos.erro} accessibilityRole="alert">{erroCarregamento}</Text>
            <TouchableOpacity onPress={() => definirTentativaCarregamento((tentativa) => tentativa + 1)} accessibilityRole="button" style={estilos.botao}>
              <Text style={estilos.acao}>Tentar novamente</Text>
            </TouchableOpacity>
          </View> : categorias.length === 0 ? <Text style={{ color: cores.textSecondary }}>Nenhuma categoria disponível.</Text> : categorias.map((categoria) => {
            const estaSelecionada = categoriaIds.includes(categoria.id);
            return <TouchableOpacity key={categoria.id} disabled={estaOcupado || (!estaSelecionada && categoriaIds.length >= 100)}
              onPress={() => alternarCategoria(categoria.id)} accessibilityRole="checkbox"
              accessibilityState={{ checked: estaSelecionada, disabled: estaOcupado || (!estaSelecionada && categoriaIds.length >= 100) }}
              style={[estilos.categoria, { borderColor: estaSelecionada ? '#0284C7' : cores.backgroundSelected }]}>
              <Text style={{ color: cores.text }}>{estaSelecionada ? 'Selecionado: ' : ''}{categoria.titulo}</Text>
            </TouchableOpacity>;
          })}
          <TouchableOpacity onPress={salvarPreferenciasSelecionadas} disabled={estaOcupado || estaCarregando || !!erroCarregamento}
            accessibilityRole="button" style={estilos.botao}>
            {estaSalvandoPreferencias ? <ActivityIndicator color="#0284C7" /> : <Text style={estilos.acao}>Salvar como minhas preferências</Text>}
          </TouchableOpacity>
          {mensagemPreferencias && <Text style={{ color: cores.text }}>{mensagemPreferencias}</Text>}
          <Text style={[estilos.descricao, { color: cores.textSecondary }]}>A caminhada é estimada pela distância em linha reta e pode variar nas ruas. O tempo até a primeira parada e o retorno não estão incluídos.</Text>
          {mensagemErro && <Text style={estilos.erro} accessibilityRole="alert">{mensagemErro}</Text>}
          <TouchableOpacity onPress={gerarRoteiroSelecionado} disabled={estaOcupado || estaCarregando || !!erroCarregamento}
            accessibilityRole="button" accessibilityState={{ disabled: estaOcupado || estaCarregando || !!erroCarregamento, busy: estaGerando }} style={estilos.botaoPrincipal}>
            {estaGerando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={estilos.textoBotao}>Gerar e salvar roteiro</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={aoFechar} disabled={estaOcupado} accessibilityRole="button" style={estilos.botao}>
            <Text style={[estilos.acao, { textAlign: 'center' }]}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: 24, gap: 16, width: '100%', maxWidth: 800, alignSelf: 'center' },
  titulo: { fontSize: 26, fontWeight: '800' },
  subtitulo: { fontSize: 18, fontWeight: '700' },
  descricao: { fontSize: 15, lineHeight: 23 },
  campo: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  categoria: { borderWidth: 1, borderRadius: 12, padding: 16 },
  erro: { color: '#DC2626', lineHeight: 22 },
  acao: { color: '#0284C7', fontWeight: '700' },
  botao: { paddingVertical: 14 },
  botaoPrincipal: { padding: 16, backgroundColor: '#0284C7', alignItems: 'center', borderRadius: 12 },
  textoBotao: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
