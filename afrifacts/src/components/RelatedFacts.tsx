import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  categoryTint,
  familyFor,
  metrics,
  radius,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';
import type { RelatedFact } from '@/src/data';

/**
 * "More about Awolowo": the facts that share this one's subject, as a row
 * you push sideways.
 *
 * A horizontal rail rather than the stacked rows this replaced, for the
 * reason a feed is vertical and this is not: the article is a column you
 * read down, and a second column at the end of it reads as more article.
 * Sideways says "these are alternatives, take one or none", and it costs
 * one card of height instead of ten rows.
 *
 * Each card carries the term it was matched on. That is not decoration:
 * the matching is derived rather than curated (see `data/related.ts`), so
 * it will sometimes be wrong, and a reader who can see WHY two facts were
 * linked can dismiss a bad link at a glance.
 */

/** Wide enough for three lines of a median-length fact, narrow enough that
 *  the next card shows and the row is visibly scrollable without a hint. */
const CARD_WIDTH = 244;

/**
 * Name the subject when the row has one.
 *
 * Facts about Awolowo mostly match each other on "Awolowo", so the heading
 * can say so. When the row is held together by several different terms
 * there is no one subject to name and a specific heading would be a lie,
 * so it falls back.
 */
function headingFor(items: RelatedFact[]): string {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.shared.length === 0) continue;
    counts.set(item.shared, (counts.get(item.shared) ?? 0) + 1);
  }

  let top = '';
  let best = 0;
  for (const [term, n] of counts) {
    if (n > best) {
      best = n;
      top = term;
    }
  }

  return best >= 2 && best >= items.length / 2 ? `More about ${top}` : 'Related facts';
}

export function RelatedFacts({
  items,
  onOpen,
}: {
  items: RelatedFact[];
  onOpen: (id: string) => void;
}) {
  const { colors, isDark } = useTheme();
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[typeScale.eyebrow, styles.heading, { color: colors.textMuted }]}>
        {headingFor(items).toUpperCase()}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // Snapping makes a flick land on a card rather than between two,
        // which is the difference between a carousel and a list that moves.
        snapToInterval={CARD_WIDTH + spacing.md}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.rail}>
        {items.map(({ fact, shared }) => {
          const family = familyFor(fact.category);
          // The pale tints are drawn for a light ground. On dark they would
          // be a row of bright slabs carrying serif body text.
          const fill = isDark ? colors.surfaceAlt : categoryTint[fact.category];

          return (
            <Pressable
              key={fact.id}
              onPress={() => onOpen(fact.id)}
              accessibilityRole="button"
              accessibilityLabel={fact.fact}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: fill, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={[typeScale.eyebrow, { color: family.mid }]} numberOfLines={1}>
                {(shared.length > 0 ? shared : fact.category).toUpperCase()}
              </Text>

              <Text
                style={[typeScale.factTiny, styles.text, { color: isDark ? colors.text : family.dark }]}
                numberOfLines={5}>
                {fact.fact}
              </Text>

              <View style={styles.foot}>
                <Text style={[typeScale.caption, { color: family.mid }]}>{fact.category}</Text>
                <Ionicons name="arrow-forward" size={14} color={family.mid} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  /*
    Out through the article's own padding, so the rail runs edge to edge
    and a card can sit half off the screen. Inside the padding it would
    stop short of both margins and read as a boxed-in list.
  */
  section: { marginHorizontal: -metrics.screenPadding, gap: spacing.md },
  heading: { paddingHorizontal: metrics.screenPadding },
  rail: { paddingHorizontal: metrics.screenPadding, gap: spacing.md },
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.tile,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  // Takes the slack, so the category and arrow sit on the floor of every
  // card in the row rather than wherever its own text happened to end.
  text: { flex: 1 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
