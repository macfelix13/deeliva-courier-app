import { Platform } from 'react-native';

/**
 * Ported from the Industry design system (project/_ds/.../styles.css) that
 * the Claude Design prototype was built on. Keep this in sync if the
 * prototype's tokens ever change.
 */
export const colors = {
  bg: '#f2f2f3',
  surface: '#e9e9ea',
  text: '#1d1f20',
  textMuted: 'rgba(29,31,32,0.55)',
  divider: 'rgba(29,31,32,0.16)',

  neutral100: '#f5f5f8',
  neutral200: '#e7e7ea',
  neutral300: '#d4d4d7',
  neutral400: '#b7b7ba',
  neutral500: '#98989b',
  neutral600: '#7a7a7d',
  neutral700: '#5d5d60',
  neutral800: '#424244',
  neutral900: '#2b2b2d',

  accent: '#5980a6',
  accent100: '#eef6ff',
  accent200: '#d6ebff',
  accent300: '#b5d9fd',
  accent400: '#94bce3',
  accent500: '#749dc4',
  accent600: '#597ea3',
  accent700: '#416180',
  accent800: '#2c455d',
  accent900: '#1d2d3d',

  white: '#ffffff',
} as const;

export const fonts = {
  body: 'Barlow_400Regular',
  bodyMedium: 'Barlow_500Medium',
  bodySemiBold: 'Barlow_600SemiBold',
  heading: 'BarlowCondensed_600SemiBold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;

export const space = {
  1: 3.4,
  2: 6.8,
  3: 10.2,
  4: 13.6,
  6: 20.4,
  8: 27.2,
} as const;
