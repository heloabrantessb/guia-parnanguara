import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { Colors } from '@/utils/theme';

export default function Perfil() {
  const scheme = useColorScheme();
  const cores = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { usuario, ehVisitante, sairDaConta } = useAutenticacao();

  return (
    <View style={[styles.container, { backgroundColor: cores.background }]}>
      <View style={styles.conteudo}>
        <View style={styles.avatarWrapper}>
          <Ionicons
            name={ehVisitante ? 'person-outline' : 'person'}
            size={48}
            color="#0284C7"
          />
        </View>

        {ehVisitante ? (
          <View style={styles.infoUsuario}>
            <Text style={[styles.nome, { color: cores.text }]}>Visitante</Text>
            <Text style={[styles.subtexto, { color: cores.textSecondary }]}>
              Você está navegando em modo visitante.
            </Text>
          </View>
        ) : (
          <View style={styles.infoUsuario}>
            <Text style={[styles.nome, { color: cores.text }]}>
              {usuario?.nome || 'Usuário'}
            </Text>
            <Text style={[styles.subtexto, { color: cores.textSecondary }]}>
              {usuario?.email || ''}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.botaoAcao,
            {
              backgroundColor: ehVisitante ? '#0284C7' : '#DC2626',
            },
          ]}
          onPress={sairDaConta}
          accessibilityRole="button"
        >
          <Ionicons
            name={ehVisitante ? 'log-in-outline' : 'log-out-outline'}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.textoBotaoAcao}>
            {ehVisitante ? 'Fazer login ou cadastrar' : 'Sair da conta'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudo: {
    width: '100%',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  infoUsuario: {
    alignItems: 'center',
    marginBottom: 32,
  },
  nome: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtexto: {
    fontSize: 14,
    textAlign: 'center',
  },
  botaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 48,
    borderRadius: 12,
  },
  textoBotaoAcao: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});