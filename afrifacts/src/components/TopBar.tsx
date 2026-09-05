import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from './Logo';
// The lookup, not the data layer: two pure functions over a country code.
import { ALL_AFRICA, flagFor, nameFor } from '@/src/data/countries';
import { amber, metrics, radius, spacing, type as typeScale, useTheme } from '@/src/theme';

/** Wordmark on the left, shuffle, country selector and streak flame on the right. */
export function TopBar({
  countryCode,
  streak,
  onPressCountry,
  onShuffle,
}: {
  countryCode: string;
  streak: number;
  onPressCountry: () => void;
  onShuffle: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <Logo />
        <Text style={[typeScale.screenTitle, { color: colors.text }]}>AfriFacts</Text>
      </View>

      <View style={styles.actions}>
        {/*
          Deals the feed again.

          It belongs beside the country pill because it is the same kind of
          control: both change which facts arrive and in what order, and
          neither belongs on the card. Icon only — a label would make three
          worded pills in a row and the wordmark would stop being the thing
          you read first.
        */}
        <Pressable
          onPress={onShuffle}
          accessibilityRole="button"
          accessibilityLabel="Shuffle the feed"
          hitSlop={6}
          style={({ pressed }) => [
            styles.pill,
            styles.icon,
            { backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.6 : 1 },
          ]}>
          <Ionicons name="shuffle" size={16} color={colors.textMuted} />
        </Pressable>

        {/*
          The country, as its flag rather than its code.

          "NG" told you nothing you did not already know and told a first
          Ghanaian reader nothing at all; a flag is recognised without
          being read. Pan-African has no flag, so it gets the map — the
          same drawing as the app icon, but the bare version: the tiled one
          sits 200px away as the wordmark, and two of those in one bar
          would read as a mistake.
        */}
        <Pressable
          onPress={onPressCountry}
          accessibilityRole="button"
          accessibilityLabel={`Country: ${nameFor(countryCode)}. Change it.`}
          style={({ pressed }) => [
            styles.pill,
            styles.icon,
            { backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.6 : 1 },
          ]}>
          {countryCode === ALL_AFRICA ? (
            <Image
              source={require('@/assets/images/map-mark.png')}
              style={styles.map}
              contentFit="contain"
            />
          ) : (
            <Text style={styles.flag}>{flagFor(countryCode)}</Text>
          )}
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
  // Square rather than the pills' wider box, so an icon sits centred in a
  // circle instead of a lozenge.
  icon: { width: metrics.topPillHeight, paddingHorizontal: 0 },
  flag: { fontSize: 18 },
  map: { width: 21, height: 21 },
  streak: { flexDirection: 'row', gap: 3 },
});
