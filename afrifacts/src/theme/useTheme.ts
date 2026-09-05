/**
 * Resolves the active colour scheme into the neutral palette.
 * Dark mode is supported from day one, so no component reads
 * useColorScheme() directly.
 */

import { useColorScheme } from 'react-native';

import { neutrals, type ColorScheme } from './colors';

export function useTheme() {
  const scheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, colors: neutrals[scheme], isDark: scheme === 'dark' };
}
