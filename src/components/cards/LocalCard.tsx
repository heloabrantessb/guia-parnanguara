import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Local } from '@/types/local';
import { CoresTema } from '@/utils/theme';
import { useTema } from '@/contexts/TemaContext';
import {
  formatarHorario,
  formatarValorEntrada,
  resolverUrlImagem,
  verificarSeEstaAberto,
} from '@/utils/formatadores';

const IMAGEM_PADRAO = require('../../assets/museu.jpeg');

interface LocalCardProps {
  local: Local;
  aoPressionar?: () => void;
}

export function LocalCard({ local, aoPressionar }: LocalCardProps) {
  const { cores } = useTema();
  const styles = criarEstilos(cores);

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

  const temHorario = Boolean(local.horario_abertura && local.horario_fechamento);
  const estaAberto = temHorario
    ? verificarSeEstaAberto(local.horario_abertura, local.horario_fechamento)
    : null;

  const textoValor = formatarValorEntrada(local.valor_entrada);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: cores.backgroundElement,
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
        {estaAberto !== null && (
          <View
            style={[
              styles.badgeStatus,
              { backgroundColor: estaAberto ? '#277257' : '#64748B' },
            ]}
          >
            <Text style={styles.textoBadgeStatus}>
              {estaAberto ? 'Aberto' : 'Fechado'}
            </Text>
          </View>
        )}
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

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  card: {
    borderRadius: 22,
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
    height: 180,
    backgroundColor: cores.marcaSuave,
    position: 'relative',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  badgeStatus: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  textoBadgeStatus: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeGratuito: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#277257',
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
