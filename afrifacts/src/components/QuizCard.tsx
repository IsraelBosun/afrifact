import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  categoryColors,
  deepGreen,
  radius,
  spacing,
  type as typeScale,
} from '@/src/theme';

/**
 * Injected into the feed every few facts, in place of a fact.
 * The ask is small and the tone is playful: nothing here shames anyone.
 */
export function QuizCard({
  seenCount,
  onPlay,
}: {
  seenCount: number;
  onPlay: () => void;
}) {
  return (
    <View style={[styles.card, { backgroundColor: categoryColors.Culture.light }]}>
      <Text style={[typeScale.eyebrow, { color: deepGreen }]}>QUICK QUIZ</Text>
      <Text style={[typeScale.headline, styles.prompt, { color: categoryColors.Culture.dark }]}>
        You have seen {seenCount} facts. Think you can score {seenCount} for {seenCount}?
      </Text>
      <Pressable style={[styles.button, { backgroundColor: categoryColors.Culture.dark }]} onPress={onPlay}>
        <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Play now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.card,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  prompt: { marginBottom: spacing.sm },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
});
