import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import '@/global.css';
import AppTabs from '@/components/app-tabs';
import {
  AutenticacaoProvider,
  useAutenticacao,
} from '@/contexts/AutenticacaoContext';
import { FluxoAutenticacao } from '@/components/autenticacao/FluxoAutenticacao';
import { TemaProvider, useTema } from '@/contexts/TemaContext';

function ConteudoApp() {
  const { estaCarregando, estaAutenticado } = useAutenticacao();
  const { cores, estaCarregandoTema } = useTema();

  if (estaCarregando || estaCarregandoTema) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: cores.background,
        }}
      >
        <ActivityIndicator size="large" color={cores.principal} />
      </View>
    );
  }

  if (!estaAutenticado) {
    return <FluxoAutenticacao />;
  }

  return <AppTabs />;
}

function NavegacaoComTema() {
  const { cores, esquema } = useTema();
  const temaBase = esquema === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider value={{ ...temaBase, colors: {
      ...temaBase.colors,
      primary: cores.principal,
      background: cores.background,
      card: cores.backgroundElement,
      text: cores.text,
      border: cores.backgroundSelected,
      notification: cores.perigo,
    } }}>
      <StatusBar style={esquema === 'dark' ? 'light' : 'dark'} />
      <AutenticacaoProvider>
        <ConteudoApp />
      </AutenticacaoProvider>
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return <TemaProvider><NavegacaoComTema /></TemaProvider>;
}
