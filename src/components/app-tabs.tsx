import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

import { Colors } from '@/utils/theme';
import { VectorIcon } from 'expo-router';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
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
