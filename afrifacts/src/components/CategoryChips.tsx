import { useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import {
  categoryColors,
  categoryTint,
  deepGreen,
  metrics,
  radius,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';
import type { Category } from '@/src/types';

/**
 * Topic lanes, not countries. "For You" is default and active.
 * An active chip fills with its category's mid stop; inactive chips
 * sit on the pale tint with mid-stop text.
 */
export function CategoryChips({
  lanes,
  active,
  onSelect,
}: {
  lanes: string[];
  active: string;
  onSelect: (lane: string) => void;
}) {
  const { colors } = useTheme();
  const scroller = useRef<ScrollView>(null);
  // Left edge of each chip inside the content, filled in by onLayout.
  const offsets = useRef<Record<string, number>>({});

  /**
   * Put the active chip on the same left edge as the feed card.
   *
   * Scrolling the row by hand leaves whichever chip you picked at an
   * arbitrary offset, so the selected lane and the card below it stop
   * sharing a gutter and the screen looks off its grid. Snapping the
   * active chip back to `screenPadding` is what keeps that line straight.
   */
  const alignActive = useCallback((lane: string, animated: boolean) => {
    const x = offsets.current[lane];
    if (x === undefined) return;
    scroller.current?.scrollTo({
      x: Math.max(0, x - metrics.screenPadding),
      animated,
    });
  }, []);

  useEffect(() => {
    alignActive(active, true);
  }, [active, alignActive]);

  return (
    <ScrollView
      ref={scroller}
      horizontal
      showsHorizontalScrollIndicator={false}
      // A horizontal ScrollView will otherwise stretch to fill the column
      // and push the feed card down.
      style={styles.scroller}
      contentContainerStyle={styles.row}>
      {lanes.map((lane) => {
        const isActive = lane === active;
        const family = categoryColors[lane as Category];

        // "For You" is not a category, so it uses the brand's deep green.
        const activeBg = family ? family.mid : deepGreen;
        const idleBg = family ? categoryTint[lane as Category] : colors.surfaceAlt;
        const idleText = family ? family.mid : deepGreen;

        return (
          <Pressable
            key={lane}
            onPress={() => onSelect(lane)}
            onLayout={(e) => {
              offsets.current[lane] = e.nativeEvent.layout.x;
              // The first layout is also the only chance to place the lane
              // that is already active when the screen opens.
              if (isActive) alignActive(lane, false);
            }}
            style={[styles.chip, { backgroundColor: isActive ? activeBg : idleBg }]}>
            <Text style={[typeScale.label, { color: isActive ? '#FFFFFF' : idleText }]}>
              {lane}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // flexGrow:0 keeps the row at its content height instead of filling the
  // column; the explicit height stops it growing before the chips measure.
  scroller: { flexGrow: 0, height: metrics.chipHeight + spacing.sm * 2 },
  row: {
    paddingHorizontal: metrics.screenPadding,
    gap: metrics.chipGap,
    paddingVertical: spacing.sm,
  },
  chip: {
    height: metrics.chipHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
