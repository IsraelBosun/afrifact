import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from './Logo';
// The lookup, not the data layer: two pure functions over a country code.
import { ALL_AFRICA, flagFor, nameFor } from '@/src/data/countries';
import { amber, metrics, radius, spacing, type as typeScale, useTheme } from '@/src/theme';

/**
 * Wordmark on the left, country selector and streak flame on the right.
 *
 * Shuffle used to sit here and now lives on the action row above the card,
 * beside search, today and listen. It was the odd one out: the country
 * pill and the streak say what the feed IS, and shuffle was the only
 * control here that changed it. Moving it also let the four things that
 * act on the feed become one legible row instead of one icon up here and
 * three nowhere.
 */
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
