import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View, useColorScheme } from 'react-native';

import '@/global.css';
import AppTabs from '@/components/app-tabs';
import {
  AutenticacaoProvider,
  useAutenticacao,
} from '@/contexts/AutenticacaoContext';
import { FluxoAutenticacao } from '@/components/autenticacao/FluxoAutenticacao';
import { Colors } from '@/utils/theme';

function ConteudoApp() {
  const { estaCarregando, estaAutenticado } = useAutenticacao();
  const scheme = useColorScheme();
  const cores = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (estaCarregando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: cores.background,
        }}
      >
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  if (!estaAutenticado) {
    return <FluxoAutenticacao />;
  }

  return <AppTabs />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AutenticacaoProvider>
        <ConteudoApp />
      </AutenticacaoProvider>
    </ThemeProvider>
  );
}
