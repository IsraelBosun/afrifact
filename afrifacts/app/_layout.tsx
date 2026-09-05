import {
  Fraunces_400Regular,
  Fraunces_500Medium,
} from '@expo-google-fonts/fraunces';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { brandGreen, neutrals, useTheme } from '@/src/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

/** React Navigation's theme, mapped onto our neutrals so the two never disagree. */
function navTheme(isDark: boolean): Theme {
  const base = isDark ? DarkTheme : DefaultTheme;
  const palette = isDark ? neutrals.dark : neutrals.light;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: brandGreen,
      background: palette.background,
      card: palette.tabBar,
      text: palette.text,
      border: palette.border,
    },
  };
}

export default function RootLayout() {
  const { isDark } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  // The app opens into a fact, so we hold the splash until type is ready
  // rather than flashing a system-font frame first.
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={navTheme(isDark)}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="fact/[id]" />
        <Stack.Screen name="quiz/play" />
        <Stack.Screen name="quiz/score" />
        {/* The picker is a bottom sheet over the feed, never a gate in front of it. */}
        <Stack.Screen
          name="country"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
