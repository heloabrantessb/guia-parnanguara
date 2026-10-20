import { StyleSheet, View } from 'react-native';
import { identidade } from '@/utils/theme';

interface SimboloLitoraneoProps {
  tamanho?: number;
}

// Formas nativas mantêm o símbolo nítido em diferentes densidades de tela.
export function SimboloLitoraneo({ tamanho = 56 }: SimboloLitoraneoProps) {
  return (
    <View style={{ width: tamanho, height: tamanho }} accessible accessibilityLabel="Guia Parnanguara: sol e ondas">
      <View style={[estilos.fundo, { transform: [{ scale: tamanho / 80 }] }]}>
        <View style={estilos.sol} />
        <View style={estilos.ondaClara} />
        <View style={estilos.ondaMangue} />
        <View style={estilos.ondaMar} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fundo: { width: 80, height: 80, position: 'absolute', top: '50%', left: '50%', marginTop: -40, marginLeft: -40, borderRadius: 24, backgroundColor: '#084C59', overflow: 'hidden' },
  sol: { width: 38, height: 38, borderRadius: 19, backgroundColor: identidade.areia, top: 15, left: 15 },
  ondaClara: { position: 'absolute', width: 100, height: 48, borderRadius: 50, backgroundColor: '#FAF7F2', top: 41, left: -7, transform: [{ rotate: '-18deg' }] },
  ondaMangue: { position: 'absolute', width: 100, height: 48, borderRadius: 50, backgroundColor: identidade.mangue, top: 49, left: -5, transform: [{ rotate: '-18deg' }] },
  ondaMar: { position: 'absolute', width: 100, height: 48, borderRadius: 50, backgroundColor: identidade.petroleo, top: 60, left: -5, transform: [{ rotate: '12deg' }] },
});
