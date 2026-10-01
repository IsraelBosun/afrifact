import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { getFactPool } from '@/src/data';
import {
  EVENING_HOUR,
  MORNING_HOUR,
  nextBooking,
  Notifications,
  setNotificationsEnabled,
  useNotificationsEnabled,
  type Booking,
} from '@/src/notifications';
import { brandGreen, radius, spacing, type as typeScale, useTheme } from '@/src/theme';

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

/**
 * The daily facts switch, with what the phone is actually holding.
 *
 * Lives on the profile rather than behind the gear: it is the one setting
 * that changes how often someone comes back, so it belongs where they
 * already look.
 */
export function DailyFactsSection() {
  const { colors } = useTheme();
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

    Without this the feature is unfalsifiable from inside the app: the
    toggle says on, and whether 28 facts are booked or none are looks
    exactly the same until seven the next morning. Reading the schedule
    back turns "I am not getting them" into an answer.
  */
  const [booking, setBooking] = useState<Booking | null>(null);

  const refreshBooking = useCallback(() => {
    nextBooking()
      .then(setBooking)
      .catch(() => setBooking(null));
  }, []);

  useEffect(refreshBooking, [refreshBooking, notify]);

  // Expo Go on Android has no notifications at all, so say that rather
  // than offer a switch that can never turn on.
  const unsupported = Notifications === null;
  const notifyLabel = unsupported
    ? 'Not available in this preview build'
    : notify
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
    <View style={styles.section}>
      <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>DAILY FACTS</Text>

      <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="notifications-outline" size={19} color={colors.textMuted} />
        <View style={styles.rowText}>
          <Text style={[typeScale.option, { color: colors.text }]}>Morning and evening</Text>
          <Text style={[typeScale.caption, { color: colors.textMuted }]}>{notifyLabel}</Text>
        </View>
        <Switch
          value={notify}
          onValueChange={(next) => void toggleNotify(next)}
          disabled={busy || unsupported}
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
        Said plainly, including when it is bad news. A switch that reads on
        over an empty schedule is the one state the reader must not be left
        guessing about.
      */}
      {notify && booking !== null && (
        <Text style={[typeScale.caption, styles.note, { color: colors.textMuted }]}>
          {booking.next === null
            ? 'Nothing is booked yet. Switch this off and on again.'
            : `Next one ${whenLabel(booking.next)}. ${booking.count} booked from here.`}
        </Text>
      )}

      {/*
        When a fortnight is booked and nothing arrives, the app is not the
        problem: many Android skins put unused apps to sleep, and a sleeping
        app's alarms do not fire. This opens the page where the reader can
        change that.
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
  );
}

const styles = StyleSheet.create({
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
});
