import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/src/components/Logo';
import { ScoreShareCard } from '@/src/components/ScoreShareCard';
import { getUserStats } from '@/src/data';
import { useShareCard } from '@/src/share/useShareCard';
import { categoryColors, deepGreen, metrics, radius, spacing, type as typeScale } from '@/src/theme';
import type { Category } from '@/src/types';

/**
 * Titles escalate with the score, and a low score is never shamed.
 * People do not share cards that embarrass them.
 */
function titleFor(score: number, total: number): string {
  const ratio = total === 0 ? 0 : score / total;
  if (ratio === 1) return 'Certified Naija scholar';
  if (ratio >= 0.67) return 'Sharp, very sharp';
  if (ratio >= 0.34) return 'You are getting there';
  return 'Fresh eyes, plenty to learn';
}

export default function ScoreScreen() {
  const params = useLocalSearchParams<{ score?: string; total?: string; category?: string }>();

  const score = Number(params.score ?? 0);
  const total = Number(params.total ?? 3);
  const category = (params.category ?? 'Culture') as Category;
  const family = categoryColors[category] ?? categoryColors.Culture;

  const title = titleFor(score, total);
  const stats = useMemo(() => getUserStats(), []);
  // The run is derived the same way the on-screen marks are, so the card
  // and the screen can never disagree.
  const results = useMemo(
    () => Array.from({ length: total }, (_, i) => i < score),
    [score, total],
  );

  const { shareView, share, sharing } = useShareCard();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: family.light }]}>
      <View style={styles.body}>
        <Text style={[typeScale.eyebrow, { color: deepGreen }]}>
          {category.toUpperCase()} QUIZ
        </Text>

        <Text style={[typeScale.display, styles.score, { color: family.dark }]}>
          {score}/{total}
        </Text>

        <Text style={[typeScale.screenTitle, styles.title, { color: family.dark }]}>
          {title}
        </Text>

        {/* Check marks showing the run. */}
        <View style={styles.marks}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.mark,
                { backgroundColor: i < score ? family.dark : 'rgba(0,0,0,0.12)' },
              ]}>
              <Ionicons
                name={i < score ? 'checkmark' : 'close'}
                size={16}
                color={i < score ? family.light : family.dark}
              />
            </View>
          ))}
        </View>

        {/* The viral mechanic, in five words. */}
        <Text style={[typeScale.option, styles.beat, { color: family.mid }]}>
          Think you can beat me?
        </Text>

        <Pressable
          onPress={() => share({ dialogTitle: 'Share your score' })}
          disabled={sharing}
          accessibilityRole="button"
          style={[styles.share, { backgroundColor: family.dark, opacity: sharing ? 0.6 : 1 }]}>
          <Ionicons name="share-social" size={18} color="#FFFFFF" />
          <Text style={[typeScale.label, { color: '#FFFFFF' }]}>
            {sharing ? 'Preparing…' : 'Share your score'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.dismissTo('/')} hitSlop={8}>
          <Text style={[typeScale.label, { color: family.dark }]}>Back to feed</Text>
        </Pressable>
      </View>

      {/* Every share is an ad, so the footer travels with the card. */}
      <View style={styles.footer}>
        <View style={styles.brand}>
          <Logo size={24} />
          <Text style={[typeScale.label, { color: family.dark }]}>AfriFacts</Text>
        </View>
        <Text style={[typeScale.caption, { color: family.mid }]}>Get it on Google Play</Text>
      </View>

      {shareView(
        <ScoreShareCard
          score={score}
          total={total}
          title={title}
          results={results}
          streak={stats.dayStreak}
        />,
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: metrics.screenPadding,
    gap: spacing.md,
  },
  score: { marginTop: spacing.sm },
  title: { textAlign: 'center' },
  marks: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  mark: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  beat: { marginTop: spacing.sm },
  share: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.screenPadding,
    paddingBottom: spacing.lg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
