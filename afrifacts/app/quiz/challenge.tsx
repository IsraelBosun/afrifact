import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getQuizByIds } from '@/src/data';
import { CHALLENGE_LENGTH, decode } from '@/src/quiz/challenge';
import { categoryColors, deepGreen, metrics, radius, spacing, type as typeScale } from '@/src/theme';

/**
 * Where a challenge link lands.
 *
 * The run does not start on arrival, deliberately. Someone who taps a
 * link in WhatsApp has not decided to play yet, and dropping them into
 * question one with a timer already moving is how you get a person who
 * backs out. One screen, one number to beat, one button.
 *
 * It is also the only place that can say "this challenge is stale"
 * kindly, which matters because the corpus moves under old links.
 */
export default function ChallengeScreen() {
  const params = useLocalSearchParams<{ c?: string; n?: string }>();
  const family = categoryColors.Records;

  const challenge = useMemo(
    () => (params.c === undefined ? null : decode(params.c, params.n ?? '')),
    [params.c, params.n],
  );

  // Decoding proves the code is well formed. It does not prove the
  // questions still exist, so they are resolved against the corpus
  // before anything is promised.
  const questions = useMemo(
    () => (challenge === null ? [] : getQuizByIds(challenge.questionIds)),
    [challenge],
  );

  const playable = challenge !== null && questions.length === CHALLENGE_LENGTH;
  const who = challenge !== null && challenge.name.length > 0 ? challenge.name : 'A friend';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: family.light }]}>
      <View style={styles.body}>
        <Text style={[typeScale.eyebrow, { color: deepGreen }]}>AFRIFACTS CHALLENGE</Text>

        {playable ? (
          <>
            <Text style={[typeScale.screenTitle, styles.centre, { color: family.dark }]}>
              {who} challenged you
            </Text>

            <View style={[styles.target, { borderColor: family.mid }]}>
              <Text style={[typeScale.display, { color: family.dark }]}>
                {challenge.score}/{CHALLENGE_LENGTH}
              </Text>
              <Text style={[typeScale.label, { color: family.mid }]}>is the score to beat</Text>
            </View>

            <Text style={[typeScale.body, styles.centre, { color: family.mid }]}>
              The same {CHALLENGE_LENGTH} questions they answered. Under 30 seconds.
            </Text>

            <Pressable
              accessibilityRole="button"
              style={[styles.play, { backgroundColor: family.dark }]}
              onPress={() =>
                router.replace({
                  pathname: '/quiz/play',
                  params: {
                    ids: challenge.questionIds.join(','),
                    vs: who,
                    vsScore: String(challenge.score),
                  },
                })
              }>
              <Ionicons name="flash" size={18} color="#FFFFFF" />
              <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Take the challenge</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[typeScale.screenTitle, styles.centre, { color: family.dark }]}>
              This challenge has expired
            </Text>
            <Text style={[typeScale.body, styles.centre, { color: family.mid }]}>
              {challenge === null
                ? 'That code did not read as an AfriFacts challenge. Check it and try again.'
                : 'Its questions are no longer in the app. Three fresh ones are waiting.'}
            </Text>

            <Pressable
              accessibilityRole="button"
              style={[styles.play, { backgroundColor: family.dark }]}
              onPress={() => router.replace('/quiz/play')}>
              <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Play a new quiz</Text>
            </Pressable>
          </>
        )}

        <Pressable onPress={() => router.replace('/')} hitSlop={8}>
          <Text style={[typeScale.label, { color: family.dark }]}>Back to feed</Text>
        </Pressable>
      </View>
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
  centre: { textAlign: 'center' },
  target: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.tile,
    borderWidth: 1.5,
    marginVertical: spacing.sm,
  },
  play: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
});
