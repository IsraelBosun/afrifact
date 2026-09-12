import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  amber,
  categoryColors,
  deepen,
  metrics,
  spacing,
  type as typeScale,
  useTheme,
  type ColorFamily,
} from '@/src/theme';

/**
 * The four things you can do to the feed, in the gap above the card:
 * deal it again, jump to today's fact, go back to the database, or find
 * one fact by name or number.
 *
 * WHY IT IS COLOURED, GIVEN §6
 *
 * §6 says one colour family per screen and never five categories on one
 * card. This is neither: it is a control cluster, and §4.5 already
 * establishes the pattern — the profile's four stat cards each take a
 * different family. Four flat circles read as one object because they are
 * the same shape and the same size, and the colour is what makes each one
 * findable by memory rather than by reading the label underneath it.
 *
 * Flat fills, no ring, no shadow, no glow (§6). The fill sits a little
 * below the light stop and the icon is the dark stop from the SAME
 * family, which is the rule for text on a coloured fill and holds in both
 * schemes without a second palette.
 *
 * WHY LABELS
 *
 * Four unlabelled circles is a puzzle. They cost eleven points of height
 * out of slack the card was not using — the card is capped by aspect ratio
 * and centred, so this row eats the air rather than the fact.
 */

/**
 * How far the fill travels from `light` toward `mid`.
 *
 * The card fills are drawn to sit under a paragraph of serif; a 46pt
 * circle carrying one icon can hold more weight than that without
 * shouting, and at the light stop the four of them read as pastel rather
 * than as buttons. Set this to 0 to put them back exactly as they were.
 */
const FILL_DEPTH = 0.22;

/** One circle. The colour carries the identity; the word confirms it. */
function Action({
  icon,
  label,
  family,
  onPress,
  active = false,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  family: ColorFamily;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useTheme();

  // Active inverts: the mid stop fills and the icon goes to the light one,
  // so a button that is doing something now looks unmistakably different
  // from three that are waiting to be pressed.
  const fill = active ? family.mid : deepen(family, FILL_DEPTH);
  const ink = active ? family.light : family.dark;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected: active }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.action,
        // A button that is busy is disabled AND active. Dimming it then
        // would read as unavailable rather than working, so the inverted
        // fill is left to say it on its own.
        { opacity: disabled && !active ? 0.4 : pressed ? 0.65 : 1 },
      ]}>
      <View style={[styles.circle, { backgroundColor: fill }]}>
        <Ionicons name={icon} size={21} color={ink} />
      </View>
      <Text style={[typeScale.caption, { color: colors.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function FeedActions({
  onShuffle,
  onToday,
  onRefresh,
  onSearch,
  refreshing,
}: {
  onShuffle: () => void;
  onToday: () => void;
  onRefresh: () => void;
  onSearch: () => void;
  /** True while the corpus is being fetched, so the button shows it is busy. */
  refreshing: boolean;
}) {
  return (
    <View style={styles.row}>
      <Action
        icon="shuffle"
        label="Shuffle"
        family={categoryColors.Culture}
        onPress={onShuffle}
      />
      {/* Amber, the same accent as the streak flame in the top bar: both
          are about the habit rather than the corpus. */}
      <Action icon="today-outline" label="Today" family={amber} onPress={onToday} />
      {/*
        The same thing a pull down the feed does, given a place someone can
        find. Pull to refresh is invisible until you already know it is
        there, and it is the one control here that goes back to the
        database rather than rearranging what is already on the phone.
      */}
      <Action
        icon="refresh"
        label="Refresh"
        family={categoryColors.Business}
        onPress={onRefresh}
        // The word stays put while it works: a label that changes length
        // shifts the other three circles sideways mid-refresh. The
        // inverted fill says it is busy without moving anything.
        active={refreshing}
        disabled={refreshing}
      />
      <Action icon="search" label="Search" family={categoryColors.Sports} onPress={onSearch} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.xl,
    paddingHorizontal: metrics.screenPadding,
    // Weighted downward: the row sits nearer the card it acts on than the
    // chips it sits under, which reads as belonging to the card rather
    // than as a second row of chips. The two paddings still sum to the
    // same height, so the card below does not move.
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  action: { alignItems: 'center', gap: spacing.xs, minWidth: 52 },
  circle: {
    width: metrics.railButton + 6,
    height: metrics.railButton + 6,
    borderRadius: (metrics.railButton + 6) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
