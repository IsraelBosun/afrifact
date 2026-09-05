import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { brandGreen, metrics, radius, spacing, type as typeScale, useTheme } from '@/src/theme';

/**
 * The offer of a daily fact. Ours, not the operating system's.
 *
 * It sits over a feed that is already running, so the reader has met a
 * fact before being asked for anything — §10 forbids a wall in front of
 * the first one, and this is an offer rather than a door.
 *
 * "Not now" is a real answer and costs nothing: the OS prompt is only
 * spent when someone says yes, which is what lets the app ask again on the
 * fifth open instead of having one shot and losing it.
 *
 * The copy names the exact times. "Enable notifications" asks for a
 * permission; "a fact at 7am and one at 6pm" describes a thing a person
 * can want or not want, which is the only fair question to put to them.
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
  const { colors } = useTheme();

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View
        style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={styles.head}>
          <View style={[styles.mark, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="notifications-outline" size={19} color={brandGreen} />
          </View>
          <View style={styles.headText}>
            <Text style={[typeScale.option, { color: colors.text }]}>Two facts a day?</Text>
            <Text style={[typeScale.caption, { color: colors.textMuted }]}>
              One at 7am, one at 6pm. No adverts, and you can stop them in Settings.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onDismiss}
            disabled={busy}
            accessibilityRole="button"
            style={({ pressed }) => [styles.ghost, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[typeScale.label, { color: colors.textMuted }]}>Not now</Text>
          </Pressable>

          <Pressable
            onPress={onAccept}
            disabled={busy}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: brandGreen, opacity: pressed || busy ? 0.75 : 1 },
            ]}>
            <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Yes, send them</Text>
          </Pressable>
        </View>
      </View>
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
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  head: { flexDirection: 'row', gap: spacing.md },
  mark: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headText: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm },
  ghost: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  primary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
});
