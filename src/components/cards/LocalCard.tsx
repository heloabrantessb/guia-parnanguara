import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Local } from '@/types/local';
import { Colors } from '@/utils/theme';
import {
  formatarHorario,
  formatarValorEntrada,
  resolverUrlImagem,
} from '@/utils/formatadores';

const IMAGEM_PADRAO = require('../../assets/museu.jpeg');

interface LocalCardProps {
  local: Local;
  aoPressionar?: () => void;
}

export function LocalCard({ local, aoPressionar }: LocalCardProps) {
  const scheme = useColorScheme();
  const cores = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Busca imagem capa ou a primeira imagem disponivel
  const imagemCapa =
    local.imagens.find((item) => item.imagem_capa) || local.imagens[0];
  const urlImagemResolvida = resolverUrlImagem(imagemCapa?.imagem_url);
  const fonteImagem = urlImagemResolvida
    ? { uri: urlImagemResolvida }
    : IMAGEM_PADRAO;

  const horarioFormatado =
    local.horario_abertura && local.horario_fechamento
      ? `${formatarHorario(local.horario_abertura)} - ${formatarHorario(
          local.horario_fechamento
        )}`
      : null;

  const textoValor = formatarValorEntrada(local.valor_entrada);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: cores.background,
          borderColor: cores.backgroundSelected,
        },
      ]}
      onPress={aoPressionar}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${local.nome}, localizado em ${local.endereco}`}
    >
      <View style={styles.containerImagem}>
        <Image
          source={fonteImagem}
          style={styles.imagem}
          resizeMode="cover"
          accessibilityLabel={local.nome}
        />
        {textoValor === 'Entrada gratuita' && (
          <View style={styles.badgeGratuito}>
            <Text style={styles.textoBadgeGratuito}>Gratuito</Text>
          </View>
        )}
      </View>

      <View style={styles.conteudo}>
        {local.categorias.length > 0 && (
          <View style={styles.linhaCategorias}>
            {local.categorias.slice(0, 2).map((categoria) => (
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

        <Text
          style={[styles.titulo, { color: cores.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {local.nome}
        </Text>

        <View style={styles.linhaInfo}>
          <Ionicons
            name="location-outline"
            size={14}
            color={cores.textSecondary}
          />
          <Text
            style={[styles.textoEndereco, { color: cores.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {local.endereco}
          </Text>
        </View>

        {horarioFormatado && (
          <View style={styles.linhaInfo}>
            <Ionicons
              name="time-outline"
              size={14}
              color={cores.textSecondary}
            />
            <Text
              style={[styles.textoHorario, { color: cores.textSecondary }]}
              numberOfLines={1}
            >
              {horarioFormatado}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  containerImagem: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  badgeGratuito: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  textoBadgeGratuito: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  conteudo: {
    padding: 14,
  },
  linhaCategorias: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  badgeCategoria: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  textoCategoria: {
    fontSize: 11,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  textoEndereco: {
    fontSize: 13,
    flexShrink: 1,
  },
  textoHorario: {
    fontSize: 12,
  },
});
