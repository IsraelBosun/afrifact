import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { categoryColors, deepGreen, radius, spacing, type as typeScale } from '@/src/theme';

/**
 * The end of the run.
 *
 * Only worth having once the cards are numbered. Before that the feed
 * simply stopped, and a list that stops reads as an app that has run out;
 * with a number on every card, reaching the last one is an achievement and
 * needs somewhere to land.
 *
 * The action is to deal again rather than to leave. Someone who reached
 * the end is the most engaged reader the app has, and sending them to a
 * dead stop is the one moment where a shuffle button is obviously the
 * right thing to offer.
 */
export function FeedEndCard({ total, onShuffle }: { total: number; onShuffle: () => void }) {
  return (
    <View style={[styles.card, { backgroundColor: categoryColors.Culture.light }]}>
      <View style={[styles.mark, { backgroundColor: categoryColors.Culture.mid }]}>
        <Ionicons name="checkmark" size={26} color={categoryColors.Culture.light} />
      </View>

      <Text style={[typeScale.eyebrow, { color: deepGreen }]}>THAT IS ALL OF THEM</Text>
      <Text style={[typeScale.headline, styles.line, { color: categoryColors.Culture.dark }]}>
        You have read all {total} facts.
      </Text>
      <Text style={[typeScale.body, styles.line, { color: categoryColors.Culture.mid }]}>
        Shuffle for a fresh run, or pull down on the feed to check for new ones.
      </Text>

      <Pressable
        onPress={onShuffle}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: categoryColors.Culture.dark, opacity: pressed ? 0.8 : 1 },
        ]}>
        <Ionicons name="shuffle" size={16} color="#FFFFFF" />
        <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Shuffle and start again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  line: { textAlign: 'center' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
  },
});
