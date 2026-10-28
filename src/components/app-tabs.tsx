import { NativeTabs } from 'expo-router/native-tabs';
import { Platform } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

import { useTema } from '@/contexts/TemaContext';
import { Tabs, VectorIcon } from 'expo-router';

const abas = [
  { nome: 'index', titulo: 'Início', icone: 'home' },
  { nome: 'explorar', titulo: 'Explorar', icone: 'explore' },
  { nome: 'rotas', titulo: 'Rotas', icone: 'route' },
  { nome: 'eventos', titulo: 'Eventos', icone: 'event' },
  { nome: 'perfil', titulo: 'Perfil', icone: 'person' },
] as const;

export default function AppTabs() {
  const { cores } = useTema();

  // Ícones das abas nativas dependem de renderização indisponível na web.
  if (Platform.OS === 'web') {
    return (
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.principal,
        tabBarInactiveTintColor: cores.textSecondary,
        tabBarStyle: { backgroundColor: cores.backgroundElement, borderTopColor: cores.backgroundSelected, height: 72, paddingTop: 8, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
        {abas.map((aba) => (
          <Tabs.Screen key={aba.nome} name={aba.nome} options={{
            title: aba.titulo,
            tabBarIcon: ({ focused: estaSelecionada, size: tamanho }) => <MaterialIcons name={aba.icone} color={estaSelecionada ? cores.principal : cores.textSecondary} size={tamanho} />,
          }} />
        ))}
      </Tabs>
    );
  }

  return (
    <NativeTabs
      backgroundColor={cores.backgroundElement}
      tintColor={cores.principal}
      indicatorColor={cores.marcaSuave}
      labelStyle={{ color: cores.textSecondary, selected: { color: cores.principal } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<VectorIcon family={MaterialIcons} name='home'/>}
            renderingMode="template"
          /> 
      </NativeTabs.Trigger>

     <NativeTabs.Trigger name='explorar'>
        <NativeTabs.Trigger.Label>Explorar</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<VectorIcon family={MaterialIcons} name='explore'/>}
            renderingMode="template"
          /> 
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='rotas'>
        <NativeTabs.Trigger.Label>Rotas</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<VectorIcon family={MaterialIcons} name='route'/>}
            renderingMode="template"
          /> 
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='eventos'>
        <NativeTabs.Trigger.Label>Eventos</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<VectorIcon family={MaterialIcons} name='event'/>}
            renderingMode="template"
          />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='perfil'>
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<VectorIcon family={MaterialIcons} name='person'/>}
            renderingMode="template"
          /> 
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
