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
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { getFactPool, loadCorpus } from '@/src/data';
import { loadNotificationSetting, noteAppOpen, syncNotifications } from '@/src/notifications';
import {
  AppThemeProvider,
  brandGreen,
  neutrals,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';

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

/**
 * Couldn't reach the database.
 *
 * A deliberate screen rather than an empty feed. The two look identical
 * to a user — no facts — and mean completely different things: one is a
 * flight-mode problem they can fix, the other looks like an app with no
 * content. §10 forbids gating the first fact behind a signup wall or an
 * onboarding carousel; it does not forbid saying the network failed.
 *
 * Since the corpus is cached, this now means something narrower than it
 * used to: no facts have EVER reached this device. Every launch after
 * the first opens from storage whether or not there is a network, so the
 * copy names the first load rather than talking about connections in
 * general.
 */
function CouldNotLoad({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.fallback, { backgroundColor: colors.background }]}>
      <Text style={[typeScale.headline, { color: colors.text }]}>No facts right now.</Text>
      <Text style={[typeScale.body, { color: colors.textMuted }]}>
        AfriFacts needs a connection once, to download its library. After that it works
        offline.
      </Text>
      <Pressable style={[styles.retry, { backgroundColor: brandGreen }]} onPress={onRetry}>
        <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Try again</Text>
      </Pressable>
      <Text style={[typeScale.caption, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

/**
 * The provider has to sit above the layout, not inside it, because the
 * layout is a consumer: it reads the resolved scheme for the navigation
 * theme and the status bar.
 */
export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutNav />
    </AppThemeProvider>
  );
}

function RootLayoutNav() {
  const { isDark, colors, ready: themeReady } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  const [corpusLoaded, setCorpusLoaded] = useState(false);
  const [corpusError, setCorpusError] = useState('');
  const [attempt, setAttempt] = useState(0);

  /*
    The corpus, loaded once at launch — from the device if it is there,
    from the database if it is not.

    Held behind the splash for the same reason as the fonts: the app
    opens directly into a fact, so a frame of empty feed is worse than a
    frame of splash. A cached launch resolves this in milliseconds, so
    the splash is barely seen. `attempt` is what the retry button bumps.
  */
  useEffect(() => {
    let live = true;
    setCorpusError('');
    loadCorpus()
      .then(async () => {
        if (!live) return;
        setCorpusLoaded(true);
        /*
          Top the notification window back up.

          Daily facts are booked as a fortnight of dated one-shots rather
          than a repeating trigger, because a repeating trigger would carry
          the same fact every morning. Rebooking on each launch is what
          turns that fortnight into something continuous — and it has to
          run after the corpus, since it schedules real facts.

          Deliberately not awaited by the splash: 28 scheduling calls
          should never stand between someone and their first fact.
        */
        await Promise.all([loadNotificationSetting(), noteAppOpen()]);
        void syncNotifications(getFactPool()).catch(() => {
          // Permission revoked, or the OS refused. `syncNotifications`
          // has already switched the setting off to match.
        });
      })
      .catch((error: unknown) => {
        if (live) setCorpusError(error instanceof Error ? error.message : String(error));
      });
    return () => {
      live = false;
    };
  }, [attempt]);

  /*
    The window behind the app, not the app.

    Without it a push or a modal shows a white flash from the native root
    view in dark mode — the one frame React Native is not painting. It
    follows the resolved scheme rather than the system one, so an explicit
    light preference on a dark phone gets a light window too.
  */
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {
      // Cosmetic. A window that keeps its default colour is not worth a
      // crash or a message.
    });
  }, [colors.background]);

  // Theme is in the gate: the stored preference has to land before the
  // first frame, or a dark-mode user sees a light one and then a flip.
  const ready =
    themeReady && (fontsLoaded || fontError !== null) && (corpusLoaded || corpusError.length > 0);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  /*
    A tapped notification opens its fact.

    The id was written into `data` when the notification was scheduled, so
    this is the other half of that and the reason the fact text alone was
    never enough. Registered once, and only after the corpus is in hand —
    routing to a fact the store cannot resolve yet would land on the
    "not available" screen.
  */
  useEffect(() => {
    if (!corpusLoaded) return;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const factId = response.notification.request.content.data?.factId;
      if (typeof factId === 'string' && factId.length > 0) {
        router.push({ pathname: '/fact/[id]', params: { id: factId } });
      }
    });
    return () => subscription.remove();
  }, [corpusLoaded]);

  /*
    Explicit, never "auto".

    `auto` resolves against the SYSTEM colour scheme, so the moment the app
    can disagree with the phone it is wrong in exactly the case the setting
    exists for: dark app on a light phone would get dark icons on a
    near-black bar. Screens whose top is a coloured panel rather than the
    page — the deep dive hero — mount their own StatusBar over this one.
  */
  const barStyle = isDark ? 'light' : 'dark';

  if (!ready) {
    return null;
  }

  if (corpusError.length > 0) {
    return (
      <ThemeProvider value={navTheme(isDark)}>
        <CouldNotLoad message={corpusError} onRetry={retry} />
        <StatusBar style={barStyle} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={navTheme(isDark)}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="fact/[id]" />
        <Stack.Screen name="quiz/play" />
        <Stack.Screen name="quiz/score" />
        <Stack.Screen name="settings" />
        {/* The picker is a bottom sheet over the feed, never a gate in front of it. */}
        <Stack.Screen
          name="country"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
      </Stack>
      <StatusBar style={barStyle} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  retry: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    marginTop: spacing.sm,
  },
});
