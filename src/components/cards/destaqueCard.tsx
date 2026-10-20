import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTema } from '@/contexts/TemaContext';
import { CoresTema } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';

export interface DestaqueCardProps {
  id?: string;
  title?: string;
  name?: string;
  category?: string;
  distance?: string;
  subtitle?: string;
  rating?: number | string;
  image?: ImageSourcePropType | string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  width?: ViewStyle['width'];
  imageHeight?: number;
  testID?: string;
}

const DEFAULT_IMAGE = require('../../assets/museu.jpeg');

export function DestaqueCard({
  title,
  name,
  category,
  distance,
  subtitle,
  rating,
  image = DEFAULT_IMAGE,
  onPress,
  style,
  width = 260,
  imageHeight = 180,
  testID,
}: DestaqueCardProps) {
  const { cores } = useTema();
  const styles = criarEstilos(cores);
  const displayTitle = title || name || 'Ponto Turístico Em Destaque';

  const displaySubtitle =
    subtitle ||
    [category, distance].filter(Boolean).join(' • ') ||
    'Conheça Paranaguá';

  const imageSource: ImageSourcePropType =
    typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rating ? `${displayTitle}, avaliação ${rating}` : displayTitle}
      testID={testID}
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && styles.cardPressed,
        style,
      ]}
    >
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={displayTitle}
        />
      </View>

      <View style={styles.infoContainer}>
        {category && <Text style={styles.categoria} numberOfLines={1}>{category}</Text>}
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {displayTitle}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={cores.textSecondary}
            style={styles.locationIcon}
          />
          <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
            {displaySubtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: cores.backgroundElement,
    borderWidth: 1,
    borderColor: cores.backgroundSelected,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      default: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: cores.marcaSuave,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.backgroundElement,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 9999,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.14,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  infoContainer: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  categoria: { color: cores.principal, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    marginRight: 1,
  },
  locationText: {
    fontSize: 12.5,
    color: cores.textSecondary,
    fontWeight: '400',
    flexShrink: 1,
  },
});

export default DestaqueCard;