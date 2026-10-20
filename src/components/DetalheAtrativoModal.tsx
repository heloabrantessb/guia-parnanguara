import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Local } from '@/types/local';
import { Evento } from '@/types/evento';
import { Colors } from '@/utils/theme';
import {
  formatarDataEvento,
  formatarHorario,
  formatarValorEntrada,
  resolverUrlImagem,
} from '@/utils/formatadores';

const IMAGEM_PADRAO = require('../assets/museu.jpeg');

interface DetalheAtrativoModalProps {
  visivel: boolean;
  atrativo: Local | Evento | null;
  aoFechar: () => void;
}

export function DetalheAtrativoModal({
  visivel,
  atrativo,
  aoFechar,
}: DetalheAtrativoModalProps) {
  const scheme = useColorScheme();
  const cores = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (!atrativo) {
    return null;
  }

  const ehEvento = 'data_inicio' in atrativo;
  const imagemCapa =
    atrativo.imagens.find((item) => item.imagem_capa) || atrativo.imagens[0];
  const urlImagemResolvida = resolverUrlImagem(imagemCapa?.imagem_url);
  const fonteImagem = urlImagemResolvida
    ? { uri: urlImagemResolvida }
    : IMAGEM_PADRAO;

  const valorFormatado = formatarValorEntrada(atrativo.valor_entrada);

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent={true}
      onRequestClose={aoFechar}
    >
      <View style={styles.fundoModal}>
        <View
          style={[
            styles.conteudoModal,
            { backgroundColor: cores.background },
          ]}
        >
          {/* Botao de fechar no topo */}
          <TouchableOpacity
            style={styles.botaoFechar}
            onPress={aoFechar}
            accessibilityRole="button"
            accessibilityLabel="Fechar detalhes"
          >
            <Ionicons name="close" size={24} color="#1E293B" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.containerImagem}>
              <Image
                source={fonteImagem}
                style={styles.imagem}
                resizeMode="cover"
              />
            </View>

            <View style={styles.corpo}>
              {atrativo.categorias.length > 0 && (
                <View style={styles.linhaCategorias}>
                  {atrativo.categorias.map((categoria) => (
                    <View
                      key={categoria.id}
                      style={[
                        styles.badgeCategoria,
                        { backgroundColor: cores.backgroundElement },
                      ]}
                    >
                      <Text
                        style={[
                          styles.textoCategoria,
                          { color: cores.textSecondary },
                        ]}
                      >
                        {categoria.titulo}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={[styles.titulo, { color: cores.text }]}>
                {atrativo.nome}
              </Text>

              <View style={styles.cartaoInfo}>
                <View style={styles.itemInfo}>
                  <Ionicons name="location-outline" size={18} color="#0284C7" />
                  <Text
                    style={[styles.textoInfo, { color: cores.textSecondary }]}
                  >
                    {atrativo.endereco}
                  </Text>
                </View>

                {ehEvento ? (
                  <View style={styles.itemInfo}>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#0284C7"
                    />
                    <Text
                      style={[styles.textoInfo, { color: cores.textSecondary }]}
                    >
                      Início: {formatarDataEvento((atrativo as Evento).data_inicio)}
                      {'\n'}Fim: {formatarDataEvento((atrativo as Evento).data_fim)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.itemInfo}>
                    <Ionicons name="time-outline" size={18} color="#0284C7" />
                    <Text
                      style={[styles.textoInfo, { color: cores.textSecondary }]}
                    >
                      Horário: {formatarHorario((atrativo as Local).horario_abertura)} às{' '}
                      {formatarHorario((atrativo as Local).horario_fechamento)}
                    </Text>
                  </View>
                )}

                <View style={styles.itemInfo}>
                  <Ionicons name="pricetag-outline" size={18} color="#0284C7" />
                  <Text
                    style={[styles.textoInfo, { color: cores.textSecondary }]}
                  >
                    {valorFormatado}
                  </Text>
                </View>
              </View>

              {atrativo.descricao ? (
                <View style={styles.secaoDescricao}>
                  <Text style={[styles.subtituloSecao, { color: cores.text }]}>
                    Sobre
                  </Text>
                  <Text
                    style={[
                      styles.textoDescricao,
                      { color: cores.textSecondary },
                    ]}
                  >
                    {atrativo.descricao}
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  conteudoModal: {
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  botaoFechar: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  containerImagem: {
    width: '100%',
    height: 220,
    backgroundColor: '#E2E8F0',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  corpo: {
    padding: 20,
  },
  linhaCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  badgeCategoria: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoCategoria: {
    fontSize: 12,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  cartaoInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  textoInfo: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  secaoDescricao: {
    marginTop: 4,
  },
  subtituloSecao: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  textoDescricao: {
    fontSize: 15,
    lineHeight: 22,
  },
});
