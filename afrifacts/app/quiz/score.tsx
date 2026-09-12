import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/src/components/Logo';
import { ScoreShareCard } from '@/src/components/ScoreShareCard';
import { getUserStats, useProgress } from '@/src/data';
import { encode, message as challengeMessage } from '@/src/quiz/challenge';
import { challengeLink, storeUrl } from '@/src/quiz/link';
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

/** The line under a head to head. Losing is never rubbed in. */
function verdictFor(score: number, theirs: number): string {
  if (score > theirs) return 'You win.';
  if (score < theirs) return 'They edged it. Rematch?';
  return 'Dead level.';
}

export default function ScoreScreen() {
  const params = useLocalSearchParams<{
    score?: string;
    total?: string;
    category?: string;
    ids?: string;
    vs?: string;
    vsScore?: string;
  }>();

  const score = Number(params.score ?? 0);
  const total = Number(params.total ?? 3);
  const category = (params.category ?? 'Culture') as Category;
  const family = categoryColors[category] ?? categoryColors.Culture;

  const title = titleFor(score, total);
  const markSize = total <= 5 ? 32 : total <= 10 ? 26 : 20;
  const stats = useMemo(() => getUserStats(), []);
  const { name } = useProgress();

  // Who this run was against, when it was a challenge rather than a
  // fresh three. Rendered as a comparison rather than as a second score,
  // because the number on its own does not say who won.
  const rival =
    params.vs === undefined && params.vsScore === undefined
      ? null
      : {
          name: params.vs !== undefined && params.vs.length > 0 ? params.vs : 'They',
          score: Number(params.vsScore ?? 0),
        };

  /*
    The questions just played, packed into eleven characters.

    Null when the run cannot be packed, which happens if a question id
    ever stops matching the shape the codec knows. The button is hidden in
    that case rather than shown broken: a challenge that resolves to the
    wrong questions is worse than no challenge button.
  */
  const code = useMemo(() => {
    const ids = params.ids === undefined ? [] : params.ids.split(',');
    return encode(ids, score);
  }, [params.ids, score]);

  const challenge = useCallback(async () => {
    if (code === null) return;
    try {
      await Share.share({
        message: challengeMessage({
          code,
          link: challengeLink(code, name),
          storeUrl: storeUrl(),
          score,
          total,
        }),
      });
    } catch {
      // A dismissed share sheet is a normal outcome, not a failure worth
      // interrupting anyone over.
    }
  }, [code, name, score, total]);
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

        {/*
          Check marks showing the run.

          The circles shrink and wrap with the run length. At three they
          are the size §4.4 drew them; at twenty, a fixed-size row runs off
          both edges of the phone, which is what a longer run would have
          done to this screen before anything else broke.
        */}
        <View style={styles.marks}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.mark,
                {
                  width: markSize,
                  height: markSize,
                  borderRadius: markSize / 2,
                  backgroundColor: i < score ? family.dark : 'rgba(0,0,0,0.12)',
                },
              ]}>
              <Ionicons
                name={i < score ? 'checkmark' : 'close'}
                size={Math.round(markSize * 0.5)}
                color={i < score ? family.light : family.dark}
              />
            </View>
          ))}
        </View>

        {rival === null ? (
          /* The viral mechanic, in five words. */
          <Text style={[typeScale.option, styles.beat, { color: family.mid }]}>
            Think you can beat me?
          </Text>
        ) : (
          <View style={[styles.head2head, { borderColor: family.mid }]}>
            <Text style={[typeScale.option, { color: family.dark }]}>
              {rival.name} got {rival.score}/{total}
            </Text>
            <Text style={[typeScale.label, { color: family.mid }]}>
              {verdictFor(score, rival.score)}
            </Text>
          </View>
        )}

        {/*
          The hero is the challenge, not the picture.

          §4.4 asks for one hero action and calls it "Share your score",
          written when the score card was the only thing a run could
          produce. A card is an advert; a challenge is an invitation with
          a reply, and it is the thing testers actually wanted to do. The
          card keeps its place directly underneath, so nothing was taken
          away to make room.
        */}
        {code !== null && (
          <Pressable
            onPress={challenge}
            accessibilityRole="button"
            style={[styles.share, { backgroundColor: family.dark }]}>
            <Ionicons name="flash" size={18} color="#FFFFFF" />
            <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Challenge a friend</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => share({ dialogTitle: 'Share your score' })}
          disabled={sharing}
          accessibilityRole="button"
          style={[styles.cardShare, { borderColor: family.dark, opacity: sharing ? 0.6 : 1 }]}>
          <Ionicons name="share-social" size={16} color={family.dark} />
          <Text style={[typeScale.label, { color: family.dark }]}>
            {sharing ? 'Preparing…' : 'Share score card'}
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
  marks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  mark: { alignItems: 'center', justifyContent: 'center' },
  beat: { marginTop: spacing.sm },
  head2head: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.tile,
    borderWidth: 1.5,
  },
  cardShare: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
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
