import { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, Modal, StyleSheet,
  Text, TouchableOpacity, useColorScheme, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { buscarRotaPorId } from '@/services/rotasService';
import { Rota } from '@/types/rota';
import { formatarValorEntrada, resolverUrlImagem } from '@/utils/formatadores';
import { Colors } from '@/utils/theme';

interface DetalheRotaModalProps {
  rotaId: number;
  tokenAcesso: string;
  aoFechar: () => void;
}

export function DetalheRotaModal({ rotaId, tokenAcesso, aoFechar }: DetalheRotaModalProps) {
  const esquemaCores = useColorScheme();
  const cores = Colors[esquemaCores === 'dark' ? 'dark' : 'light'];
  const [rota, definirRota] = useState<Rota | null>(null);
  const [estaCarregando, definirEstaCarregando] = useState(true);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);
  const [tentativaCarregamento, definirTentativaCarregamento] = useState(0);

  useEffect(() => {
    let estaMontado = true;
    async function carregarDetalhesRota() {
      definirEstaCarregando(true);
      definirMensagemErro(null);
      try {
        const rotaRecebida = await buscarRotaPorId(rotaId, tokenAcesso);
        if (estaMontado) definirRota(rotaRecebida);
      } catch {
        if (estaMontado) {
          definirMensagemErro('Não foi possível abrir o roteiro. Verifique sua conexão e tente novamente.');
        }
      } finally {
        if (estaMontado) definirEstaCarregando(false);
      }
    }
    carregarDetalhesRota();
    return () => { estaMontado = false; };
  }, [rotaId, tokenAcesso, tentativaCarregamento]);

  const paradasOrdenadas = [...(rota?.itens ?? [])].sort(
    (primeiraParada, segundaParada) => primeiraParada.ordem - segundaParada.ordem
  );

  return (
    <Modal animationType="slide" onRequestClose={aoFechar} presentationStyle="pageSheet">
      <SafeAreaView style={[estilos.tela, { backgroundColor: cores.background }]}>
        <View style={estilos.cabecalho}>
          <TouchableOpacity
            onPress={aoFechar}
            accessibilityRole="button"
            accessibilityLabel="Voltar para minhas rotas"
            style={estilos.botaoVoltar}
          >
            <Ionicons name="arrow-back" size={24} color={cores.text} />
            <Text style={[estilos.textoVoltar, { color: cores.text }]}>Minhas Rotas</Text>
          </TouchableOpacity>
        </View>
        {estaCarregando ? (
          <View style={estilos.estado}>
            <ActivityIndicator size="large" color="#0284C7" accessibilityLabel="Carregando roteiro" />
          </View>
        ) : mensagemErro ? (
          <View style={estilos.estado}>
            <Text style={[estilos.descricao, { color: cores.text }]} accessibilityRole="alert">
              {mensagemErro}
            </Text>
            <TouchableOpacity
              onPress={() => definirTentativaCarregamento((tentativa) => tentativa + 1)}
              accessibilityRole="button"
              style={estilos.botaoTentarNovamente}
            >
              <Text style={estilos.textoTentarNovamente}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={paradasOrdenadas}
            keyExtractor={(parada) => String(parada.id)}
            contentContainerStyle={estilos.lista}
            ListHeaderComponent={
              <View style={estilos.resumo}>
                <Text style={[estilos.titulo, { color: cores.text }]} accessibilityRole="header">
                  {rota?.titulo}
                </Text>
                <Text style={[estilos.descricao, { color: cores.textSecondary }]}>
                  {paradasOrdenadas.length === 1 ? '1 parada no seu passeio' :
                    `${paradasOrdenadas.length} paradas no seu passeio`}
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={estilos.estado}>
                <Ionicons name="map-outline" size={44} color={cores.textSecondary} />
                <Text style={[estilos.descricao, { color: cores.textSecondary }]}>
                  Este roteiro ainda não tem paradas.
                </Text>
              </View>
            }
            renderItem={({ item: parada, index: indiceParada }) => {
              const atrativo = parada.atrativo;
              const imagem = atrativo.imagens.find((itemImagem) => itemImagem.imagem_capa)
                ?? atrativo.imagens[0];
              const urlImagem = resolverUrlImagem(imagem?.imagem_url);
              return (
                <View style={[estilos.parada, { borderColor: cores.backgroundSelected }]}>
                  <Image
                    source={urlImagem ? { uri: urlImagem } : require('../../assets/museu.jpeg')}
                    style={estilos.imagem}
                    accessibilityLabel={atrativo.nome}
                  />
                  <View style={estilos.conteudoParada}>
                    <Text style={estilos.numeroParada}>PARADA {indiceParada + 1}</Text>
                    <Text style={[estilos.nomeParada, { color: cores.text }]} accessibilityRole="header">
                      {atrativo.nome}
                    </Text>
                    <Text style={[estilos.descricao, { color: cores.textSecondary }]}>{atrativo.endereco}</Text>
                    <Text style={[estilos.descricao, { color: cores.textSecondary }]}>{atrativo.descricao}</Text>
                    <Text style={estilos.preco}>{formatarValorEntrada(atrativo.valor_entrada)}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  cabecalho: { paddingHorizontal: 16, paddingVertical: 8 },
  botaoVoltar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  textoVoltar: { fontSize: 16, fontWeight: '600' },
  lista: { padding: 20, paddingBottom: 40, width: '100%', maxWidth: 800, alignSelf: 'center' },
  resumo: { marginBottom: 24 },
  titulo: { fontSize: 28, fontWeight: '800' },
  descricao: { fontSize: 15, lineHeight: 23, marginTop: 8 },
  estado: { padding: 28, alignItems: 'center', justifyContent: 'center' },
  parada: { borderWidth: 1, borderRadius: 18, overflow: 'hidden', marginBottom: 20 },
  imagem: { width: '100%', height: 160, resizeMode: 'cover' },
  conteudoParada: { padding: 20 },
  numeroParada: { color: '#0284C7', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  nomeParada: { fontSize: 21, fontWeight: '700' },
  preco: { color: '#0284C7', fontSize: 14, fontWeight: '600', marginTop: 16 },
  botaoTentarNovamente: { padding: 16, marginTop: 12 },
  textoTentarNovamente: { color: '#0284C7', fontWeight: '700' },
});
