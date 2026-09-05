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
  questionCount,
  onPlay,
}: {
  seenCount: number;
  /** How long the run actually is. Not the same number as `seenCount`. */
  questionCount: number;
  onPlay: () => void;
}) {
  return (
    <View style={[styles.card, { backgroundColor: categoryColors.Culture.light }]}>
      <Text style={[typeScale.eyebrow, { color: deepGreen }]}>QUICK QUIZ</Text>
      {/*
        Two different numbers, which used to be one.

        The score line read "score {seenCount} for {seenCount}", and that
        was only ever right by accident: the injection interval and the
        quiz length were both 3. With facts arriving every seven it would
        have promised a fourteen-question run and delivered three.
      */}
      <Text style={[typeScale.headline, styles.prompt, { color: categoryColors.Culture.dark }]}>
        You have seen {seenCount} facts. Think you can score {questionCount} for {questionCount}?
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
