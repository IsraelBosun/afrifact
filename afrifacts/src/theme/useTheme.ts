/**
 * Resolves the active colour scheme into the neutral palette.
 * Dark mode is supported from day one, so no component reads
 * useColorScheme() directly.
 *
 * The scheme now comes from `AppThemeProvider`, which layers a stored user
 * preference over the system one. The return shape is unchanged, so every
 * component that only wanted `colors` never noticed.
 */

import { useContext } from 'react';
import { useColorScheme } from 'react-native';

import { neutrals, type ColorScheme } from './colors';
import { ThemeContext, type ThemeValue } from './ThemeProvider';

export function useTheme(): ThemeValue {
  // Both hooks run unconditionally; the system one is only consulted when
  // there is no provider above, which in this app means an off-screen
  // render rather than a mistake.
  const system = useColorScheme();
  const provided = useContext(ThemeContext);
  if (provided) return provided;

  const scheme: ColorScheme = system === 'dark' ? 'dark' : 'light';
  return {
    scheme,
    colors: neutrals[scheme],
    isDark: scheme === 'dark',
    preference: 'system',
    setPreference: () => {},
    ready: true,
  };
}
