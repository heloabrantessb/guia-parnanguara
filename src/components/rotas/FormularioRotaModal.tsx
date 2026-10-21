import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CoresTema } from '@/utils/theme';
import { useTema } from '@/contexts/TemaContext';

interface FormularioRotaModalProps {
  tituloInicial: string;
  tituloFormulario: string;
  aoSalvar: (titulo: string) => Promise<void>;
  aoFechar: () => void;
}

export function FormularioRotaModal({
  tituloInicial,
  tituloFormulario,
  aoSalvar,
  aoFechar,
}: FormularioRotaModalProps) {
  const { cores } = useTema();
  const estilos = criarEstilos(cores);
  const [titulo, definirTitulo] = useState(tituloInicial);
  const [estaSalvando, definirEstaSalvando] = useState(false);
  const [mensagemErro, definirMensagemErro] = useState<string | null>(null);

  async function salvarFormulario() {
    if (estaSalvando) return;
    const tituloLimpo = titulo.trim();
    if (!tituloLimpo || tituloLimpo.length > 255) {
      definirMensagemErro('Informe um nome com 1 a 255 caracteres.');
      return;
    }
    definirEstaSalvando(true);
    definirMensagemErro(null);
    try {
      await aoSalvar(tituloLimpo);
    } catch {
      definirMensagemErro('Não foi possível salvar o roteiro. Verifique sua conexão e tente novamente.');
      definirEstaSalvando(false);
    }
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={() => {
      if (!estaSalvando) aoFechar();
    }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={estilos.fundo}
      >
        <View style={[estilos.cartao, { backgroundColor: cores.background }]}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={[estilos.titulo, { color: cores.text }]} accessibilityRole="header">
              {tituloFormulario}
            </Text>
            <Text style={[estilos.rotulo, { color: cores.textSecondary }]}>Nome do roteiro</Text>
            <TextInput
              value={titulo}
              onChangeText={definirTitulo}
              editable={!estaSalvando}
              maxLength={255}
              autoFocus
              placeholder="Ex.: Passeio pelo Centro Histórico"
              placeholderTextColor={cores.textSecondary}
              accessibilityLabel="Nome do roteiro"
              returnKeyType="done"
              onSubmitEditing={salvarFormulario}
              style={[estilos.campo, { color: cores.text, borderColor: cores.backgroundSelected }]}
            />
            {mensagemErro && <Text accessibilityRole="alert" style={estilos.erro}>{mensagemErro}</Text>}
            <View style={estilos.acoes}>
              <TouchableOpacity
                onPress={aoFechar}
                disabled={estaSalvando}
                accessibilityRole="button"
                style={estilos.botao}
              >
                <Text style={{ color: cores.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={salvarFormulario}
                disabled={estaSalvando}
                accessibilityRole="button"
                accessibilityLabel="Salvar roteiro"
                accessibilityState={{ disabled: estaSalvando, busy: estaSalvando }}
                style={[estilos.botao, estilos.botaoSalvar]}
              >
                {estaSalvando ? <ActivityIndicator color="#FFFFFF" /> :
                  <Text style={estilos.textoSalvar}>Salvar roteiro</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', padding: 24 },
  cartao: { padding: 24, borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90%', alignSelf: 'center' },
  titulo: { fontSize: 22, fontWeight: '700' },
  rotulo: { marginTop: 24, marginBottom: 8, fontSize: 14 },
  campo: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  erro: { color: cores.perigo, marginTop: 12, lineHeight: 21 },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  botao: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
  botaoSalvar: { backgroundColor: cores.acao },
  textoSalvar: { color: '#FFFFFF', fontWeight: '700' },
});
