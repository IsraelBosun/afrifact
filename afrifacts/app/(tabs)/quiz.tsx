import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUserStats, unansweredCount, useProgress } from '@/src/data';
import { decode } from '@/src/quiz/challenge';
import { RUN_LENGTHS, setQuizLength, useQuizLength, type RunLength } from '@/src/quiz/length';
import {
  categoryColors,
  deepGreen,
  metrics,
  radius,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';

/** The quiz tab: a short invitation into the same three-question run. */
export default function QuizTabScreen() {
  const { colors } = useTheme();
  const stats = useMemo(() => getUserStats(), []);
  const family = categoryColors.Culture;

  // Recomputed whenever progress changes, so finishing a run updates the
  // count behind you rather than showing yesterday's number.
  const length = useQuizLength();
  const { answeredQuestions } = useProgress();
  const left = useMemo(() => unansweredCount(answeredQuestions), [answeredQuestions]);

  const [code, setCode] = useState('');
  const [bad, setBad] = useState(false);

  const open = () => {
    if (decode(code) === null) {
      setBad(true);
      return;
    }
    setBad(false);
    setCode('');
    router.push({ pathname: '/quiz/challenge', params: { c: code } });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.body}>
        <View style={[styles.card, { backgroundColor: family.light }]}>
          <Text style={[typeScale.eyebrow, { color: deepGreen }]}>DAILY QUIZ</Text>
          <Text style={[typeScale.headline, { color: family.dark }]}>
            {length} questions{length === 3 ? ', under 30 seconds.' : '.'}
          </Text>
          <Text style={[typeScale.body, { color: family.mid }]}>
            Right or wrong, every answer explains the fact behind it.
          </Text>

          {/*
            How long a run is.

            §4.3 fixed this at three and said long packs come later. Three
            is still the default and still what the feed's quiz card
            offers; this is for the reader who has answered three and
            wants to keep going, which was the whole of the complaint.
          */}
          <View style={styles.lengths}>
            {RUN_LENGTHS.map((n: RunLength) => {
              const active = n === length;
              return (
                <Pressable
                  key={n}
                  onPress={() => setQuizLength(n)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${n} questions`}
                  style={[
                    styles.lengthChip,
                    {
                      backgroundColor: active ? family.dark : 'transparent',
                      borderColor: active ? family.dark : family.mid,
                    },
                  ]}>
                  <Text style={[typeScale.label, { color: active ? '#FFFFFF' : family.mid }]}>
                    {n}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.play, { backgroundColor: family.dark }]}
            onPress={() => router.push({ pathname: '/quiz/play', params: { length: String(length) } })}>
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Play now</Text>
          </Pressable>
        </View>

        <View style={styles.tiles}>
          <View style={[styles.tile, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[typeScale.statFigure, { color: colors.text }]}>{stats.quizAccuracy}%</Text>
            <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>QUIZ ACCURACY</Text>
          </View>
          {/*
            Questions left, not questions answered.

            A count that goes up is a scoreboard; a count that goes down
            is a reason to come back. It is also the only honest way to
            say that nothing repeats until this reaches zero.
          */}
          <View style={[styles.tile, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[typeScale.statFigure, { color: colors.text }]}>{left}</Text>
            <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>NEVER ASKED YET</Text>
          </View>
        </View>

        {/*
          The typed way in.

          A challenge link opens the app directly, but `afrifacts://` is
          not tappable everywhere: WhatsApp and X linkify http(s) and
          leave an unknown scheme as plain text. The same message carries
          eleven characters for exactly that case, and this is where they
          go. It accepts the whole pasted message too, since that is what
          people actually paste.
        */}
        <View style={styles.challenge}>
          <TextInput
            value={code}
            onChangeText={(next) => {
              setCode(next);
              setBad(false);
            }}
            onSubmitEditing={open}
            placeholder="Paste a challenge code"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="go"
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surfaceAlt,
                borderColor: bad ? '#B3261E' : 'transparent',
              },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open challenge"
            onPress={open}
            style={[styles.go, { backgroundColor: family.dark }]}>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
        {bad && (
          <Text style={[typeScale.caption, styles.error, { color: '#B3261E' }]}>
            That does not read as a challenge code.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, padding: metrics.screenPadding, gap: spacing.lg, justifyContent: 'center' },
  card: { borderRadius: radius.card, padding: spacing.xl, gap: spacing.md },
  play: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  lengths: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  lengthChip: {
    minWidth: 52,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  tiles: { flexDirection: 'row', gap: spacing.md },
  tile: { flex: 1, borderRadius: radius.tile, padding: spacing.xl, gap: spacing.xs },
  challenge: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  go: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { marginTop: -spacing.sm },
});
