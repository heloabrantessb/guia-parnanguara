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
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { Colors } from '@/utils/theme';

interface TelaCadastroProps {
  aoNavegarLogin: () => void;
}

export function TelaCadastro({ aoNavegarLogin }: TelaCadastroProps) {
  const scheme = useColorScheme();
  const cores = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { cadastrar, entrarComoVisitante } = useAutenticacao();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [estaSubmetendo, setEstaSubmetendo] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  function validarFormulario(): boolean {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();

    if (!nomeLimpo || !emailLimpo || !senha || !confirmarSenha) {
      setMensagemErro('Preencha todos os campos obrigatórios.');
      return false;
    }

    if (nomeLimpo.length < 2) {
      setMensagemErro('O nome deve ter pelo menos 2 caracteres.');
      return false;
    }

    const emailValido = /\S+@\S+\.\S+/.test(emailLimpo);
    if (!emailValido) {
      setMensagemErro('Insira um endereço de e-mail válido.');
      return false;
    }

    if (senha.length < 6) {
      setMensagemErro('A senha deve ter no mínimo 6 caracteres.');
      return false;
    }

    if (senha !== confirmarSenha) {
      setMensagemErro('As senhas digitadas não coincidem.');
      return false;
    }

    return true;
  }

  async function lidarComCadastro() {
    setMensagemErro(null);

    if (!validarFormulario()) {
      return;
    }

    try {
      setEstaSubmetendo(true);
      await cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
      });
    } catch (erro) {
      if (erro instanceof Error) {
        setMensagemErro(erro.message);
      } else {
        setMensagemErro('Ocorreu um erro ao realizar o cadastro.');
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
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={aoNavegarLogin}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela de login"
          >
            <Ionicons name="arrow-back" size={24} color={cores.text} />
          </TouchableOpacity>

          <Text style={[styles.titulo, { color: cores.text }]}>Criar Conta</Text>
          <Text style={[styles.subtitulo, { color: cores.textSecondary }]}>
            Cadastre-se para aproveitar todos os recursos do Guia Parnanguara
          </Text>
        </View>

        {mensagemErro && (
          <View style={styles.alertaErro}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.textoErro}>{mensagemErro}</Text>
          </View>
        )}

        <View style={styles.formulario}>
          <View style={styles.campo}>
            <Text style={[styles.rotulo, { color: cores.text }]}>
              Nome completo
            </Text>
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
                name="person-outline"
                size={20}
                color={cores.textSecondary}
                style={styles.iconeInput}
              />
              <TextInput
                style={[styles.input, { color: cores.text }]}
                placeholder="Seu nome completo"
                placeholderTextColor={cores.textSecondary}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            </View>
          </View>

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
                placeholder="Mínimo de 6 caracteres"
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

          <View style={styles.campo}>
            <Text style={[styles.rotulo, { color: cores.text }]}>
              Confirmar senha
            </Text>
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
                name="shield-checkmark-outline"
                size={20}
                color={cores.textSecondary}
                style={styles.iconeInput}
              />
              <TextInput
                style={[styles.input, { color: cores.text }]}
                placeholder="Repita sua senha"
                placeholderTextColor={cores.textSecondary}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!mostrarSenha}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={lidarComCadastro}
            disabled={estaSubmetendo}
            accessibilityRole="button"
          >
            {estaSubmetendo ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBotaoPrincipal}>Criar conta</Text>
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
            <Text style={{ color: cores.textSecondary }}>Já possui conta? </Text>
            <TouchableOpacity onPress={aoNavegarLogin} accessibilityRole="button">
              <Text style={styles.textoLink}>Entre aqui</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  cabecalho: {
    marginBottom: 24,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 12,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    lineHeight: 20,
  },
  alertaErro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  textoErro: {
    color: '#B91C1C',
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
    backgroundColor: '#0284C7',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0284C7',
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
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 14,
  },
});
