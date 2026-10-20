import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/utils/theme';

export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';
const chaveTema = '@guia-parnanguara:tema';

function usePreferenciaTema() {
  const esquemaSistema = useColorScheme();
  const [preferencia, definirPreferencia] = useState<PreferenciaTema>('sistema');
  const [estaCarregandoTema, definirEstaCarregandoTema] = useState(true);
  const [erroTema, definirErroTema] = useState<string | null>(null);
  const filaSalvamento = useRef(Promise.resolve());

  useEffect(() => {
    let estaMontado = true;
    AsyncStorage.getItem(chaveTema).then((preferenciaSalva) => {
      if (estaMontado && (preferenciaSalva === 'claro' || preferenciaSalva === 'escuro')) {
        definirPreferencia(preferenciaSalva);
      }
    }).catch(() => {
      if (estaMontado) definirErroTema('Não foi possível recuperar a aparência salva.');
    }).finally(() => {
      if (estaMontado) definirEstaCarregandoTema(false);
    });
    return () => { estaMontado = false; };
  }, []);

  function alterarPreferenciaTema(novaPreferencia: PreferenciaTema) {
    definirPreferencia(novaPreferencia);
    definirErroTema(null);
    // Serializar evita que toques rápidos gravem uma escolha anterior por último.
    filaSalvamento.current = filaSalvamento.current.then(async () => {
      try {
        await AsyncStorage.setItem(chaveTema, novaPreferencia);
      } catch {
        definirErroTema('A aparência foi aplicada, mas não pôde ser salva neste dispositivo.');
      }
    });
  }

  const esquema = preferencia === 'sistema'
    ? (esquemaSistema === 'dark' ? 'dark' : 'light')
    : (preferencia === 'escuro' ? 'dark' : 'light');

  return { cores: Colors[esquema], esquema, preferencia, alterarPreferenciaTema, estaCarregandoTema, erroTema };
}

const TemaContext = createContext<ReturnType<typeof usePreferenciaTema> | null>(null);

export function TemaProvider({ children }: PropsWithChildren) {
  const tema = usePreferenciaTema();
  return <TemaContext.Provider value={tema}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const tema = useContext(TemaContext);
  if (!tema) throw new Error('useTema deve ser utilizado dentro de TemaProvider.');
  return tema;
}
