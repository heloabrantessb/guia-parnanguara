import '@/global.css';

import { Platform } from 'react-native';

// A referência litorânea orienta os acentos; os tons de leitura variam por tema.
export const identidade = {
  petroleo: '#126B78',
  mangue: '#32866A',
  coral: '#D65A4A',
  areia: '#D9A45B',
} as const;

export const Colors = {
  light: {
    text: '#123F47',
    background: '#FAF7F2',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#DFE7E1',
    textSecondary: '#536D70',
    principal: '#126B78',
    acao: '#126B78',
    marcaSuave: '#E4F0EC',
    sucesso: '#277257',
    perigo: '#B33E35',
    perigoSuave: '#FBEAE5',
    destaque: '#084C59',
    sobreDestaque: '#FFFFFF',
    detalheDestaque: '#C8E6E2',
  },
  dark: {
    text: '#EDF5F1',
    background: '#0C2026',
    backgroundElement: '#163139',
    backgroundSelected: '#2E4B51',
    textSecondary: '#AEC5C5',
    principal: '#80D0D3',
    acao: '#126B78',
    marcaSuave: '#20443F',
    sucesso: '#85CDB0',
    perigo: '#FFA699',
    perigoSuave: '#452D2C',
    destaque: '#123B46',
    sobreDestaque: '#FFFFFF',
    detalheDestaque: '#C8E6E2',
  },
} as const;

export type CoresTema = { [Chave in keyof typeof Colors.light]: string };

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
