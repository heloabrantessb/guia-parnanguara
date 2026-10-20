import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { PreferenciaTema, useTema } from '@/contexts/TemaContext';
import { SimboloLitoraneo } from '@/components/identidade/SimboloLitoraneo';
import { CoresTema } from '@/utils/theme';

const opcoesTema = [
  { valor: 'claro', titulo: 'Claro', icone: 'sunny-outline' },
  { valor: 'escuro', titulo: 'Escuro', icone: 'moon-outline' },
  { valor: 'sistema', titulo: 'Automático', icone: 'phone-portrait-outline' },
] as const;

export default function Perfil() {
  const { cores, preferencia, alterarPreferenciaTema, erroTema } = useTema();
  const estilos = criarEstilos(cores);
  const { usuario, ehVisitante, sairDaConta } = useAutenticacao();

  function selecionarTema(novaPreferencia: PreferenciaTema) {
    alterarPreferenciaTema(novaPreferencia);
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <Text style={estilos.sobretitulo}>SEU GUIA, DO SEU JEITO</Text>
        <Text style={estilos.titulo} accessibilityRole="header">Meu perfil</Text>
        <View style={estilos.cartaoUsuario}>
          <View style={estilos.avatar}>
            <Ionicons name="person-outline" size={32} color={cores.principal} />
          </View>
          <View style={estilos.identificacao}>
            <Text style={estilos.nome}>{ehVisitante ? 'Olá, visitante' : usuario?.nome || 'Usuário'}</Text>
            <Text style={estilos.subtexto}>
              {ehVisitante ? 'Que bom ter você por aqui.' : usuario?.email}
            </Text>
          </View>
        </View>

        <View style={estilos.cartao}>
          <View style={estilos.cabecalhoSecao}>
            <Ionicons name="color-palette-outline" size={22} color={cores.principal} />
            <Text style={estilos.tituloSecao}>Aparência</Text>
          </View>
          <Text style={estilos.subtexto}>Escolha como quer explorar o litoral.</Text>
          <View style={estilos.opcoes} accessibilityRole="radiogroup" accessibilityLabel="Tema do aplicativo">
            {opcoesTema.map((opcao) => {
              const estaSelecionado = preferencia === opcao.valor;
              return (
                <TouchableOpacity
                  key={opcao.valor}
                  style={[estilos.opcao, estaSelecionado && estilos.opcaoSelecionada]}
                  onPress={() => selecionarTema(opcao.valor)}
                  accessibilityRole="radio"
                  accessibilityLabel={opcao.titulo}
                  accessibilityState={{ checked: estaSelecionado }}
                  aria-checked={estaSelecionado}
                >
                  <Ionicons name={opcao.icone} size={24} color={estaSelecionado ? cores.principal : cores.textSecondary} />
                  <Text style={[estilos.textoOpcao, estaSelecionado && { color: cores.principal }]}>{opcao.titulo}</Text>
                  <Ionicons name={estaSelecionado ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={estaSelecionado ? cores.principal : cores.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={estilos.legenda}>
            {preferencia === 'sistema' ? 'Acompanha a aparência do seu dispositivo.' : 'Sua escolha será lembrada neste dispositivo.'}
          </Text>
          {erroTema && <Text style={estilos.erro} accessibilityRole="alert">{erroTema}</Text>}
        </View>

        <TouchableOpacity
          style={estilos.botaoConta}
          onPress={sairDaConta}
          accessibilityRole="button"
        >
          <Ionicons name={ehVisitante ? 'log-in-outline' : 'log-out-outline'} size={20} color={ehVisitante ? cores.principal : cores.perigo} />
          <Text style={[estilos.textoBotaoConta, { color: ehVisitante ? cores.principal : cores.perigo }]}>
            {ehVisitante ? 'Fazer login ou cadastrar' : 'Sair da conta'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={cores.textSecondary} />
        </TouchableOpacity>
        <View style={estilos.marca}>
          <SimboloLitoraneo tamanho={44} />
          <Text style={estilos.nomeMarca}>Guia Parnanguara</Text>
          <Text style={estilos.legenda}>Turismo · Cultura · Natureza</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const criarEstilos = (cores: CoresTema) => StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.background },
  conteudo: { padding: 24, paddingBottom: 40, width: '100%', maxWidth: 640, alignSelf: 'center' },
  sobretitulo: { color: cores.principal, fontSize: 11, letterSpacing: 1.8, fontWeight: '700', marginTop: 16 },
  titulo: { color: cores.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginTop: 8, marginBottom: 28 },
  cartaoUsuario: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28 },
  avatar: { width: 64, height: 64, borderRadius: 24, backgroundColor: cores.marcaSuave, alignItems: 'center', justifyContent: 'center' },
  identificacao: { flex: 1, gap: 4 },
  nome: { color: cores.text, fontSize: 20, fontWeight: '700' },
  subtexto: { color: cores.textSecondary, fontSize: 14, lineHeight: 21 },
  cartao: { padding: 20, backgroundColor: cores.backgroundElement, borderRadius: 24, borderWidth: 1, borderColor: cores.backgroundSelected },
  cabecalhoSecao: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  tituloSecao: { color: cores.text, fontSize: 18, fontWeight: '700' },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20, marginBottom: 14 },
  opcao: { flex: 1, minWidth: 64, paddingVertical: 16, paddingHorizontal: 4, borderRadius: 16, borderWidth: 1, borderColor: cores.backgroundSelected, alignItems: 'center', gap: 10 },
  opcaoSelecionada: { backgroundColor: cores.marcaSuave, borderColor: cores.principal },
  textoOpcao: { color: cores.textSecondary, fontSize: 12, fontWeight: '600' },
  legenda: { color: cores.textSecondary, fontSize: 12, lineHeight: 18 },
  erro: { color: cores.perigo, fontSize: 13, lineHeight: 20, marginTop: 10 },
  botaoConta: { padding: 20, backgroundColor: cores.backgroundElement, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, borderWidth: 1, borderColor: cores.backgroundSelected },
  textoBotaoConta: { flex: 1, fontWeight: '600', fontSize: 14 },
  marca: { alignItems: 'center', marginTop: 40, gap: 8 },
  nomeMarca: { color: cores.text, fontSize: 16, fontWeight: '800' },
});
