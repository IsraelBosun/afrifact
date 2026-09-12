import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';

import { amber, metrics, radius, spacing, type as typeScale } from '@/src/theme';

/**
 * The offer of a daily fact. Ours, not the operating system's.
 *
 * It sits over a feed that is already running, so the reader has met a
 * fact before being asked for anything. Section 10 forbids a wall in front
 * of the first one, and this is an offer rather than a door, which is also
 * why there is no scrim behind it and why the wrapper stays
 * `box-none`: the feed underneath keeps working while it is up.
 *
 * "Not now" is a real answer and costs nothing: the OS prompt is only
 * spent when someone says yes, which is what lets the app ask again on the
 * fifth open instead of having one shot and losing it.
 *
 * The copy names the exact times. "Enable notifications" asks for a
 * permission; "a fact at 7am and one at 6pm" describes a thing a person
 * can want or not want, which is the only fair question to put to them.
 * The times are shown as two pills rather than buried in the sentence,
 * because they are the whole substance of what is being agreed to.
 *
 * WHY AMBER
 *
 * Section 6 gives every screen one colour family and ties the family to
 * the category, but this belongs to no category. Amber is the theme's
 * standing accent for streaks and daily-goal moments, which is exactly
 * what a daily fact at 7am is, and it is the one family that cannot
 * collide with the card behind it. A solid fill also means this reads the
 * same in dark mode without a second palette: the sheet brings its own
 * ground rather than borrowing the screen's.
 */
export function NotifyPrompt({
  onAccept,
  onDismiss,
  busy,
}: {
  onAccept: () => void;
  onDismiss: () => void;
  busy: boolean;
}) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Animated.View
        entering={SlideInDown.springify().damping(18).mass(0.6)}
        exiting={FadeOut.duration(160)}
        style={styles.sheet}>
        <View style={styles.head}>
          <View style={styles.mark}>
            <Ionicons name="notifications" size={20} color={amber.light} />
          </View>
          <Text style={[typeScale.headline, styles.title]}>Two facts a day?</Text>
        </View>

        <View style={styles.times}>
          <Animated.View entering={FadeIn.delay(140)} style={styles.pill}>
            <Ionicons name="sunny" size={13} color={amber.dark} />
            <Text style={[typeScale.label, styles.pillText]}>7:00 am</Text>
          </Animated.View>
          <Animated.View entering={FadeIn.delay(220)} style={styles.pill}>
            <Ionicons name="moon" size={13} color={amber.dark} />
            <Text style={[typeScale.label, styles.pillText]}>6:00 pm</Text>
          </Animated.View>
        </View>

        <Text style={[typeScale.body, styles.blurb]}>
          No adverts, nothing else. Stop them any time in Settings.
        </Text>

        <Pressable
          onPress={onAccept}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Yes, send me two facts a day"
          style={({ pressed }) => [styles.primary, { opacity: pressed || busy ? 0.72 : 1 }]}>
          <Text style={[typeScale.label, styles.primaryText]}>
            {busy ? 'Just a moment…' : 'Yes, send them'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          disabled={busy}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.ghost, { opacity: pressed ? 0.55 : 1 }]}>
          <Text style={[typeScale.label, styles.ghostText]}>Not now</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Pinned low so the card it covers is still readable behind it.
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: metrics.screenPadding,
  },
  sheet: {
    backgroundColor: amber.light,
    borderRadius: radius.sheet,
    padding: spacing.xl,
    gap: spacing.md,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: amber.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, color: amber.dark },
  times: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    // A wash of the dark stop rather than a new colour, so the pills read
    // as part of the sheet instead of sitting on top of it.
    backgroundColor: 'rgba(99,56,6,0.14)',
  },
  pillText: { color: amber.dark },
  blurb: { color: amber.mid },
  primary: {
    backgroundColor: amber.dark,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryText: { color: '#FFFFFF' },
  ghost: { alignItems: 'center', paddingVertical: spacing.sm },
  ghostText: { color: amber.mid },
});
