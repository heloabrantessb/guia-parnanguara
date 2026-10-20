import { Image } from 'react-native';

const posesMascote = {
  explorador: {
    imagem: require('../../assets/mascote-caranguejo.png'),
    descricao: 'Mascote do Guia Parnanguara: caranguejo sorridente com chapéu e mala de viagem',
  },
  horizonte: {
    imagem: require('../../assets/mascote-horizonte.png'),
    descricao: 'Caranguejo de chapéu e mala, de costas, acenando para o horizonte do litoral',
  },
  mapa: {
    imagem: require('../../assets/mascote-mapa.png'),
    descricao: 'Caranguejo de chapéu consultando um mapa para planejar o passeio',
  },
} as const;

interface MascoteCaranguejoProps {
  tamanho?: number;
  pose?: keyof typeof posesMascote;
}

export function MascoteCaranguejo({ tamanho = 120, pose = 'explorador' }: MascoteCaranguejoProps) {
  const ilustracao = posesMascote[pose];
  return (
    <Image
      source={ilustracao.imagem}
      style={{ width: tamanho, height: tamanho, flexShrink: 0 }}
      resizeMode="contain"
      accessible
      accessibilityLabel={ilustracao.descricao}
    />
  );
}
