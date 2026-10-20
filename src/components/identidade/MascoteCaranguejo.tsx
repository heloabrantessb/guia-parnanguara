import { Image } from 'react-native';

interface MascoteCaranguejoProps {
  tamanho?: number;
}

export function MascoteCaranguejo({ tamanho = 120 }: MascoteCaranguejoProps) {
  return (
    <Image
      source={require('../../assets/mascote-caranguejo.png')}
      style={{ width: tamanho, height: tamanho, flexShrink: 0 }}
      resizeMode="contain"
      accessible
      accessibilityLabel="Mascote do Guia Parnanguara: caranguejo sorridente com chapéu e mala de viagem"
    />
  );
}
