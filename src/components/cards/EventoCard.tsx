import { ReactNode } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Evento } from '@/types/evento';
import { CoresTema } from '@/utils/theme';
import { useTema } from '@/contexts/TemaContext';
import {
  formatarDataEvento,
  resolverUrlImagem,
} from '@/utils/formatadores';

const IMAGEM_PADRAO = require('../../assets/museu.jpeg');

interface EventoCardProps {
  evento: Evento;
  aoPressionar?: () => void;
  estilo?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function EventoCard({
  evento,
  aoPressionar,
  estilo,
  children,
}: EventoCardProps) {
  const { cores } = useTema();
  const styles = criarEstilos(cores);

  const imagemCapa =
    evento.imagens.find((item) => item.imagem_capa) || evento.imagens[0];
  const urlImagemResolvida = resolverUrlImagem(imagemCapa?.imagem_url);
  const fonteImagem = urlImagemResolvida
    ? { uri: urlImagemResolvida }
    : IMAGEM_PADRAO;

  const dataFormatada = formatarDataEvento(evento.data_inicio);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: cores.backgroundElement,
          borderColor: cores.backgroundSelected,
        },
        estilo,
      ]}
      onPress={aoPressionar}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Evento: ${evento.nome}`}
    >
      <View style={styles.containerImagem}>
        <Image
          source={fonteImagem}
          style={styles.imagem}
          resizeMode="cover"
          accessibilityLabel={evento.nome}
        />
        <View style={styles.badgeData}>
          <Ionicons name="calendar-outline" size={12} color="#FFFFFF" />
          <Text style={styles.textoBadgeData}>{dataFormatada}</Text>
        </View>
      </View>

      <View style={styles.conteudo}>
        <Text
          style={[styles.titulo, { color: cores.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {evento.nome}
        </Text>

        <View style={styles.linhaInfo}>
          <Ionicons
            name="location-outline"
            size={13}
            color={cores.textSecondary}
          />
          <Text
            style={[styles.textoEndereco, { color: cores.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {evento.endereco}
          </Text>
        </View>
        {children}
      </View>
    </TouchableOpacity>
  );
}

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  card: {
    width: 230,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  containerImagem: {
    width: '100%',
    height: 150,
    backgroundColor: cores.marcaSuave,
    position: 'relative',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  badgeData: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: cores.acao,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  textoBadgeData: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  conteudo: {
    padding: 12,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoEndereco: {
    fontSize: 12,
    flexShrink: 1,
  },
});
