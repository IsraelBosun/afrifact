import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from './Logo';
import { amber, metrics, radius, spacing, type as typeScale, useTheme } from '@/src/theme';

/** Wordmark on the left, country selector and streak flame on the right. */
export function TopBar({
  countryCode,
  streak,
  onPressCountry,
}: {
  countryCode: string;
  streak: number;
  onPressCountry: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <Logo />
        <Text style={[typeScale.screenTitle, { color: colors.text }]}>AfriFacts</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onPressCountry}
          style={[styles.pill, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[typeScale.label, { color: colors.textMuted }]}>{countryCode}</Text>
        </Pressable>

        <View style={[styles.pill, styles.streak, { backgroundColor: amber.light }]}>
          <Ionicons name="flame" size={13} color={amber.dark} />
          <Text style={[typeScale.label, { color: amber.dark }]}>{streak}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.screenPadding,
    paddingVertical: spacing.sm,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pill: {
    height: metrics.topPillHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streak: { flexDirection: 'row', gap: 3 },
});
