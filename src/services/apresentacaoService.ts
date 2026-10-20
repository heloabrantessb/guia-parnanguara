import AsyncStorage from '@react-native-async-storage/async-storage';

const chaveApresentacao = '@guia_parnanguara:apresentacao_concluida';

export async function buscarApresentacaoConcluida(): Promise<boolean> {
  return (await AsyncStorage.getItem(chaveApresentacao)) === 'true';
}

export async function salvarApresentacaoConcluida(): Promise<void> {
  await AsyncStorage.setItem(chaveApresentacao, 'true');
}
