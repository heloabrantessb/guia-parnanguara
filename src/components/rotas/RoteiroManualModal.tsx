import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listarLocais } from '@/services/locaisService';
import { listarEventos } from '@/services/eventosService';
import { AtrativoRota } from '@/types/rota';
import { CoresTema } from '@/utils/theme';
import { useTema } from '@/contexts/TemaContext';

interface RoteiroManualModalProps {
  aoSalvar: (titulo: string, atrativoIds: number[]) => Promise<void>;
  aoFechar: () => void;
}

export function RoteiroManualModal({ aoSalvar, aoFechar }: RoteiroManualModalProps) {
  const { cores } = useTema();
  const estilos = criarEstilos(cores);
  const [titulo, definirTitulo] = useState('');
  const [atrativos, definirAtrativos] = useState<AtrativoRota[]>([]);
  const [atrativoIds, definirAtrativoIds] = useState<number[]>([]);
  const [estaCarregando, definirEstaCarregando] = useState(true);
  const [estaSalvando, definirEstaSalvando] = useState(false);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [erroCarregamento, definirErroCarregamento] = useState<string | null>(null);
  const [tentativaCarregamento, definirTentativaCarregamento] = useState(0);

  useEffect(() => {
    let estaMontado = true;
    async function carregarAtrativos() {
      definirEstaCarregando(true);
      definirErroCarregamento(null);
      try {
        const [locais, eventos] = await Promise.all([listarLocais(), listarEventos()]);
        const atrativosAtivos = [...locais, ...eventos].filter((atrativo) => atrativo.ativo);
        if (estaMontado) definirAtrativos(atrativosAtivos);
      } catch {
        if (estaMontado) definirErroCarregamento('Não foi possível carregar os atrativos. Tente novamente.');
      } finally {
        if (estaMontado) definirEstaCarregando(false);
      }
    }
    carregarAtrativos();
    return () => { estaMontado = false; };
  }, [tentativaCarregamento]);

  function alternarAtrativo(atrativoId: number) {
    definirMensagemErro(null);
    definirAtrativoIds((idsAtuais) => idsAtuais.includes(atrativoId)
      ? idsAtuais.filter((id) => id !== atrativoId)
      : [...idsAtuais, atrativoId]);
  }

  async function salvarRoteiroManual() {
    if (estaSalvando) return;
    if (!titulo.trim() || titulo.trim().length > 255) {
      definirMensagemErro('Informe um nome com 1 a 255 caracteres.');
      return;
    }
    if (atrativoIds.length === 0 || atrativoIds.length > 100) {
      definirMensagemErro('Selecione de 1 a 100 paradas para o roteiro.');
      return;
    }
    definirEstaSalvando(true);
    definirMensagemErro(null);
    try {
      await aoSalvar(titulo.trim(), atrativoIds);
    } catch (erro) {
      definirMensagemErro(erro instanceof Error ? erro.message : 'Não foi possível salvar o roteiro. Tente novamente.');
      definirEstaSalvando(false);
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={() => { if (!estaSalvando) aoFechar(); }}>
      <SafeAreaView style={[estilos.tela, { backgroundColor: cores.background }]}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={[estilos.titulo, { color: cores.text }]} accessibilityRole="header">Montar roteiro</Text>
          <Text style={[estilos.descricao, { color: cores.textSecondary }]}>Escolha locais e eventos na ordem em que deseja visitá-los. Para mudar a ordem, remova uma parada e selecione novamente.</Text>
          <Text style={{ color: cores.text }}>Nome do roteiro</Text>
          <TextInput
            value={titulo} onChangeText={definirTitulo} editable={!estaSalvando} maxLength={255}
            placeholder="Ex.: Passeio pelo Centro Histórico" placeholderTextColor={cores.textSecondary}
            accessibilityLabel="Nome do roteiro"
            style={[estilos.campo, { color: cores.text, borderColor: cores.backgroundSelected }]}
          />
          <Text style={[estilos.subtitulo, { color: cores.text }]}>Paradas selecionadas ({atrativoIds.length}/100)</Text>
          {atrativoIds.length === 0 && <Text style={{ color: cores.textSecondary }}>Nenhuma parada selecionada.</Text>}
          {atrativoIds.map((id, indice) => {
            const atrativo = atrativos.find((item) => item.id === id);
            return <TouchableOpacity key={id} disabled={estaSalvando} onPress={() => alternarAtrativo(id)}
              style={estilos.parada} accessibilityRole="button" accessibilityLabel={`Remover parada ${indice + 1}: ${atrativo?.nome}`}>
              <Text style={[estilos.nomeParada, { color: cores.text }]}>{indice + 1}. {atrativo?.nome}</Text>
              <Text style={estilos.acao}>Remover</Text>
            </TouchableOpacity>;
          })}
          <Text style={[estilos.subtitulo, { color: cores.text }]}>Locais e eventos disponíveis</Text>
          {estaCarregando ? <ActivityIndicator accessibilityLabel="Carregando atrativos" color={cores.principal} /> : erroCarregamento ? (
            <View>
              <Text style={estilos.erro} accessibilityRole="alert">{erroCarregamento}</Text>
              <TouchableOpacity onPress={() => definirTentativaCarregamento((tentativa) => tentativa + 1)} accessibilityRole="button" style={estilos.botao}>
                <Text style={estilos.acao}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : atrativos.length === 0 ? <Text style={{ color: cores.textSecondary }}>Nenhum atrativo disponível.</Text> : atrativos.map((atrativo) => {
            const estaSelecionado = atrativoIds.includes(atrativo.id);
            return <TouchableOpacity key={atrativo.id} onPress={() => alternarAtrativo(atrativo.id)}
              disabled={estaSalvando || (!estaSelecionado && atrativoIds.length >= 100)}
              accessibilityRole="checkbox" accessibilityState={{ checked: estaSelecionado, disabled: estaSalvando || (!estaSelecionado && atrativoIds.length >= 100) }}
              style={[estilos.cartao, { borderColor: estaSelecionado ? cores.principal : cores.backgroundSelected }]}>
              <Text style={[estilos.nomeParada, { color: cores.text }]}>{estaSelecionado ? 'Selecionado: ' : ''}{atrativo.nome}</Text>
              <Text style={{ color: cores.textSecondary }}>{atrativo.endereco}</Text>
            </TouchableOpacity>;
          })}
          {mensagemErro && <Text style={estilos.erro} accessibilityRole="alert">{mensagemErro}</Text>}
          <TouchableOpacity onPress={salvarRoteiroManual} disabled={estaSalvando || estaCarregando || !!erroCarregamento}
            accessibilityRole="button" accessibilityState={{ disabled: estaSalvando || estaCarregando || !!erroCarregamento, busy: estaSalvando }} style={estilos.botaoPrincipal}>
            {estaSalvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={estilos.textoBotao}>Salvar roteiro</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={aoFechar} disabled={estaSalvando} accessibilityRole="button" style={estilos.botao}>
            <Text style={[estilos.acao, { textAlign: 'center' }]}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: 24, gap: 16, width: '100%', maxWidth: 800, alignSelf: 'center' },
  titulo: { fontSize: 26, fontWeight: '800' },
  subtitulo: { fontSize: 18, fontWeight: '700' },
  descricao: { fontSize: 15, lineHeight: 23 },
  campo: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  parada: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  nomeParada: { flex: 1, fontSize: 16, fontWeight: '600' },
  cartao: { padding: 16, gap: 8, borderWidth: 1, borderRadius: 12 },
  acao: { color: cores.principal, fontWeight: '700' },
  erro: { color: cores.perigo, lineHeight: 22 },
  botao: { padding: 16 },
  botaoPrincipal: { padding: 16, backgroundColor: cores.acao, alignItems: 'center', borderRadius: 12 },
  textoBotao: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
