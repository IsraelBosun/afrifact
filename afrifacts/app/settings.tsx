import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/auth';
import { getFactPool } from '@/src/data';
import {
  EVENING_HOUR,
  MORNING_HOUR,
  nextBooking,
  setNotificationsEnabled,
  useNotificationsEnabled,
  type Booking,
} from '@/src/notifications';
import {
  brandGreen,
  metrics,
  radius,
  spacing,
  THEME_PREFERENCES,
  type as typeScale,
  useTheme,
  type ThemePreference,
} from '@/src/theme';

/**
 * Settings. The account, appearance and daily facts.
 *
 * Deliberately its own screen rather than a block on the profile: the
 * profile is a record of what someone has done — streak, facts, accuracy —
 * and a control that repaints the app is a different kind of thing. It
 * also gives later settings somewhere to land instead of growing the
 * profile a tail.
 */

const OPTIONS: Record<
  ThemePreference,
  { label: string; hint: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  system: {
    label: 'Match my phone',
    hint: 'Follows your device setting',
    icon: 'phone-portrait-outline',
  },
  light: { label: 'Light', hint: 'Always the warm paper', icon: 'sunny-outline' },
  dark: { label: 'Dark', hint: 'Always the near-black', icon: 'moon-outline' },
};

const DEVELOPER_NAME = 'Blue Hydra Labs';
const DEVELOPER_URL = 'http://bluehydralabs.com/';

/** 7 and 18 as "7am" and "6pm", without pulling in a date library. */
function clockLabel(hour: number): string {
  const suffix = hour < 12 ? 'am' : 'pm';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}${suffix}`;
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** "today at 6pm", "tomorrow at 7am", "Thursday at 7am". */
function whenLabel(date: Date): string {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  // Whole days between the two midnights, so "tomorrow" means tomorrow
  // rather than "in more than 24 hours".
  const days = Math.floor((date.getTime() - midnight.getTime()) / 86_400_000);
  const day = days === 0 ? 'today' : days === 1 ? 'tomorrow' : DAY_NAMES[date.getDay()];
  return `${day} at ${clockLabel(date.getHours())}`;
}

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const notify = useNotificationsEnabled();
  const [busy, setBusy] = useState(false);
  /*
    Set only when a request comes back refused.

    The switch cannot just slide to on and hope: Android grants one prompt
    and remembers a denial, so the honest response to a refusal is to leave
    the switch off and say where the decision now lives.
  */
  const [denied, setDenied] = useState(false);

  /*
    What the operating system is actually holding.

    Until this line existed the feature was unfalsifiable from inside the
    app: the toggle said on, and whether 28 facts were booked or none were
    looked exactly the same until seven the next morning. Reading the
    schedule back turns "I am not getting them" into an answer — either
    nothing is booked, which is ours to fix, or a fortnight is booked and
    the phone is not firing it, which is the reader's battery settings.
  */
  const [booking, setBooking] = useState<Booking | null>(null);

  const refreshBooking = useCallback(() => {
    nextBooking()
      .then(setBooking)
      .catch(() => setBooking(null));
  }, []);

  useEffect(refreshBooking, [refreshBooking, notify]);

  const notifyLabel = notify
    ? `A fact at ${clockLabel(MORNING_HOUR)} and ${clockLabel(EVENING_HOUR)}`
    : 'Off';

  const toggleNotify = useCallback(
    async (next: boolean) => {
      setBusy(true);
      setDenied(false);
      try {
        const landed = await setNotificationsEnabled(next, getFactPool());
        if (next && !landed) setDenied(true);
      } finally {
        setBusy(false);
        refreshBooking();
      }
    },
    [refreshBooking],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.back, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[typeScale.screenTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AccountSection />

        <View style={styles.section}>
          <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>APPEARANCE</Text>

          {THEME_PREFERENCES.map((option) => {
            const { label, hint, icon } = OPTIONS[option];
            const isSelected = option === preference;
            return (
              <Pressable
                key={option}
                onPress={() => setPreference(option)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={label}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? brandGreen : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}>
                <Ionicons name={icon} size={19} color={colors.textMuted} />
                <View style={styles.rowText}>
                  <Text style={[typeScale.option, { color: colors.text }]}>{label}</Text>
                  <Text style={[typeScale.caption, { color: colors.textMuted }]}>{hint}</Text>
                </View>

                {isSelected && (
                  <View style={[styles.check, { backgroundColor: brandGreen }]}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            );
          })}

          {/*
            No preview, and no confirm. The screen the switch is on is
            itself the preview — every surface behind the sheet repaints on
            the tap, which is the fastest possible way to find out whether
            you like it.
          */}
        </View>

        <View style={styles.section}>
          <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>DAILY FACTS</Text>

          <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="notifications-outline" size={19} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={[typeScale.option, { color: colors.text }]}>Morning and evening</Text>
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>
                {notifyLabel}
              </Text>
            </View>
            <Switch
              value={notify}
              onValueChange={(next) => void toggleNotify(next)}
              disabled={busy}
              trackColor={{ false: colors.border, true: brandGreen }}
              thumbColor="#FFFFFF"
            />
          </View>

          {denied && (
            <Text style={[typeScale.caption, styles.note, { color: colors.textMuted }]}>
              Notifications are switched off for AfriFacts in your phone&apos;s settings. Turn them
              back on there and this switch will work.
            </Text>
          )}

          {/*
            Said plainly, including when it is bad news. A switch that reads
            on over an empty schedule is the one state the reader must not
            be left guessing about.
          */}
          {notify && booking !== null && (
            <Text style={[typeScale.caption, styles.note, { color: colors.textMuted }]}>
              {booking.next === null
                ? 'Nothing is booked yet. Switch this off and on again.'
                : `Next one ${whenLabel(booking.next)}. ${booking.count} booked from here.`}
            </Text>
          )}

          {/*
            The other half of the answer.

            When a fortnight is booked and nothing arrives, the app is not
            the problem: Android and most manufacturer skins on top of it
            put unused apps to sleep, and a sleeping app's alarms do not
            fire. We cannot change that from in here, so this opens the page
            where the reader can.
          */}
          {notify && Platform.OS === 'android' && (
            <Pressable
              onPress={() => void Linking.openSettings()}
              accessibilityRole="button"
              accessibilityLabel="Open AfriFacts settings on your phone"
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <Ionicons name="battery-half-outline" size={19} color={colors.textMuted} />
              <View style={styles.rowText}>
                <Text style={[typeScale.option, { color: colors.text }]}>Not arriving?</Text>
                <Text style={[typeScale.caption, { color: colors.textMuted }]}>
                  Some phones stop sleeping apps from waking up. Allow AfriFacts to run in the
                  background.
                </Text>
              </View>
              <Ionicons name="open-outline" size={16} color={colors.textFaint} />
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>ABOUT</Text>
          <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.rowText}>
              <Text style={[typeScale.option, { color: colors.text }]}>AfriFacts</Text>
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>Version {version}</Text>
            </View>
          </View>

          {/* Opens in the system browser, the same way a fact's source does. */}
          <Pressable
            onPress={() => void WebBrowser.openBrowserAsync(DEVELOPER_URL)}
            accessibilityRole="link"
            accessibilityLabel={`Open ${DEVELOPER_NAME}`}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <Ionicons name="code-slash-outline" size={19} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={[typeScale.option, { color: colors.text }]}>Built by {DEVELOPER_NAME}</Text>
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>
                {DEVELOPER_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.textFaint} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Signed out: one row that opens the account screen. Signed in: who, and
 * the way out.
 *
 * Hidden entirely in a build with no Supabase configured, rather than
 * shown and broken.
 */
function AccountSection() {
  const { colors } = useTheme();
  const auth = useAuth();

  if (!auth.available || auth.loading) return null;

  function confirmSignOut() {
    Alert.alert(
      'Sign out?',
      'Your progress stays in your account. This phone starts fresh until you log in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => void signOut(false) },
      ],
    );
  }

  async function signOut(force: boolean) {
    const result = await auth.signOut(force);
    if (result.error === undefined || force) return;
    // Signing out wipes the phone, so an unsent run would be lost for
    // good. Say so, and let the reader decide.
    Alert.alert('Not backed up yet', result.error, [
      { text: 'Stay signed in', style: 'cancel' },
      { text: 'Sign out anyway', style: 'destructive', onPress: () => void signOut(true) },
    ]);
  }

  return (
    <View style={styles.section}>
      <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>ACCOUNT</Text>

      {auth.signedIn ? (
        <>
          <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="person-circle-outline" size={19} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={[typeScale.option, { color: colors.text }]} numberOfLines={1}>
                {auth.email ?? 'Signed in'}
              </Text>
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>
                Your progress is backed up
              </Text>
            </View>
          </View>
          <Pressable
            onPress={confirmSignOut}
            disabled={auth.busy}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: auth.busy ? 0.5 : pressed ? 0.75 : 1,
              },
            ]}>
            <Ionicons name="log-out-outline" size={19} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={[typeScale.option, { color: colors.text }]}>Sign out</Text>
            </View>
          </Pressable>
        </>
      ) : (
        <Pressable
          onPress={() => router.push('/auth/sign-in')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <Ionicons name="cloud-upload-outline" size={19} color={colors.textMuted} />
          <View style={styles.rowText}>
            <Text style={[typeScale.option, { color: colors.text }]}>Save your progress</Text>
            <Text style={[typeScale.caption, { color: colors.textMuted }]}>
              Log in or create an account to keep your streak on any phone
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: metrics.screenPadding,
    paddingBottom: spacing.lg,
  },
  back: { marginLeft: -spacing.xs },
  scroll: {
    paddingHorizontal: metrics.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  section: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.tile,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowText: { flex: 1, gap: 2 },
  note: { paddingHorizontal: spacing.xs },
  check: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
