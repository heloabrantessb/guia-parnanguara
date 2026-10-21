import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MascoteCaranguejo } from '@/components/identidade/MascoteCaranguejo';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { CoresTema } from '@/utils/theme';
import { useTema } from '@/contexts/TemaContext';

interface TelaLoginProps {
  aoNavegarCadastro: () => void;
}

export function TelaLogin({ aoNavegarCadastro }: TelaLoginProps) {
  const { cores } = useTema();
  const styles = criarEstilos(cores);

  const { entrar, entrarComoVisitante } = useAutenticacao();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [estaSubmetendo, setEstaSubmetendo] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  async function lidarComLogin() {
    setMensagemErro(null);

    const emailLimpo = email.trim();
    if (!emailLimpo || !senha) {
      setMensagemErro('Preencha seu e-mail e senha para continuar.');
      return;
    }

    try {
      setEstaSubmetendo(true);
      await entrar({ email: emailLimpo, senha });
    } catch (erro) {
      if (erro instanceof Error) {
        setMensagemErro(erro.message);
      } else {
        setMensagemErro('Ocorreu um erro ao entrar. Tente novamente.');
      }
    } finally {
      setEstaSubmetendo(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: cores.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cabecalho}>
          <View style={{ marginBottom: 20 }}><MascoteCaranguejo tamanho={140} /></View>
          <Text style={[styles.titulo, { color: cores.text }]}>
            Guia Parnanguara
          </Text>
          <Text style={[styles.subtitulo, { color: cores.textSecondary }]}>
            Turismo, cultura e natureza.
            Seu encontro com o litoral começa aqui.
          </Text>
        </View>

        {mensagemErro && (
          <View style={styles.alertaErro}>
            <Ionicons name="alert-circle" size={18} color={cores.perigo} />
            <Text style={styles.textoErro}>{mensagemErro}</Text>
          </View>
        )}

        <View style={styles.formulario}>
          <View style={styles.campo}>
            <Text style={[styles.rotulo, { color: cores.text }]}>E-mail</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: cores.backgroundElement,
                  borderColor: cores.backgroundSelected,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={cores.textSecondary}
                style={styles.iconeInput}
              />
              <TextInput
                style={[styles.input, { color: cores.text }]}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor={cores.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.campo}>
            <Text style={[styles.rotulo, { color: cores.text }]}>Senha</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: cores.backgroundElement,
                  borderColor: cores.backgroundSelected,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={cores.textSecondary}
                style={styles.iconeInput}
              />
              <TextInput
                style={[styles.input, { color: cores.text }]}
                placeholder="Sua senha"
                placeholderTextColor={cores.textSecondary}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
                accessibilityRole="button"
                accessibilityLabel="Alternar visualização da senha"
              >
                <Ionicons
                  name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={cores.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={lidarComLogin}
            disabled={estaSubmetendo}
            accessibilityRole="button"
          >
            {estaSubmetendo ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBotaoPrincipal}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divisorLinha}>
            <View
              style={[
                styles.linha,
                { backgroundColor: cores.backgroundSelected },
              ]}
            />
            <Text style={[styles.divisorTexto, { color: cores.textSecondary }]}>
              ou
            </Text>
            <View
              style={[
                styles.linha,
                { backgroundColor: cores.backgroundSelected },
              ]}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.botaoVisitante,
              { borderColor: cores.backgroundSelected },
            ]}
            onPress={entrarComoVisitante}
            accessibilityRole="button"
          >
            <Ionicons name="compass-outline" size={20} color={cores.text} />
            <Text style={[styles.textoBotaoVisitante, { color: cores.text }]}>
              Entrar como visitante
            </Text>
          </TouchableOpacity>

          <View style={styles.rodape}>
            <Text style={{ color: cores.textSecondary }}>
              Não possui uma conta?{' '}
            </Text>
            <TouchableOpacity
              onPress={aoNavegarCadastro}
              accessibilityRole="button"
            >
              <Text style={styles.textoLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  cabecalho: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconeWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.marcaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  alertaErro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.perigoSuave,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  textoErro: {
    color: cores.perigo,
    fontSize: 13,
    flexShrink: 1,
  },
  formulario: {
    width: '100%',
  },
  campo: {
    marginBottom: 16,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  iconeInput: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  botaoPrincipal: {
    backgroundColor: cores.acao,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: cores.acao,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divisorLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  linha: {
    flex: 1,
    height: 1,
  },
  divisorTexto: {
    marginHorizontal: 12,
    fontSize: 13,
  },
  botaoVisitante: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textoBotaoVisitante: {
    fontSize: 15,
    fontWeight: '600',
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  textoLink: {
    color: cores.principal,
    fontWeight: '700',
    fontSize: 14,
  },
});
