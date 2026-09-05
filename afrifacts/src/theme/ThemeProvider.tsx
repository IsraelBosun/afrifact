/**
 * Which palette the app is in, and who decides.
 *
 * Dark mode was in from day one but the system owned it: the app read
 * `useColorScheme()` and that was the end of it. Plenty of people run
 * their phone light and read in the dark, or the other way round, and had
 * no way to say so. This adds the third state that makes it a preference
 * rather than a mirror — `system`, which is still the default, plus an
 * explicit `light` and `dark` that override it.
 *
 * The preference is on the device, not in the corpus cache. A shape change
 * to `Fact` throws that cache away (see `data/cache.ts`), and losing
 * someone's dark mode to a content migration would be absurd.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { neutrals, type ColorScheme } from './colors';

/** `system` follows the phone. The other two ignore it. */
export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];

/** The palette for whichever scheme won. */
export type Neutrals = (typeof neutrals)[ColorScheme];

export interface ThemeValue {
  scheme: ColorScheme;
  colors: Neutrals;
  isDark: boolean;
  /** What the user asked for, which is not always what they got. */
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  /** False until the stored preference has been read off the device. */
  ready: boolean;
}

/*
  Versioned, like the corpus cache, and for the same reason: a stored value
  from a build that meant something else by it should become unreachable
  rather than be reinterpreted.
*/
const KEY = 'afrifacts.theme.v1';

function isPreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as string[]).includes(value);
}

/**
 * Null outside the provider, which `useTheme` treats as "follow the
 * system". The app always provides — the root layout is the provider — so
 * this is the path taken by an off-screen render such as the share card
 * capture, where falling back beats throwing.
 */
export const ThemeContext = createContext<ThemeValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setStored] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  /*
    Read once at launch. The root layout holds the splash until `ready`,
    so nobody sees a light frame before a stored dark preference lands —
    which is the whole failure this flag exists to prevent, and the most
    visible bug a theme setting can have.
  */
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(KEY)
      .then((value) => {
        if (live && isPreference(value)) setStored(value);
      })
      .catch(() => {
        // An unreadable preference is the default preference.
      })
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    // State first, storage after. The switch should move under the finger
    // at the speed of a render, not of a disk write, and a write that
    // fails costs the setting next launch rather than this one.
    setStored(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  }, []);

  const value = useMemo<ThemeValue>(() => {
    const scheme: ColorScheme =
      preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
    return {
      scheme,
      colors: neutrals[scheme],
      isDark: scheme === 'dark',
      preference,
      setPreference,
      ready,
    };
  }, [preference, system, setPreference, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
