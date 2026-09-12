import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getFactById, getQuiz, getQuizByIds, recordQuizRun } from '@/src/data';
import { useAnswerSounds } from '@/src/quiz/sounds';
import {
  brandGreen,
  categoryTint,
  familyFor,
  feedback,
  metrics,
  radius,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';

/** How long the feedback block stays up before the quiz advances itself. */
const ADVANCE_DELAY = 1900;

/**
 * Three questions, under 30 seconds.
 *
 * On answer the correct option turns green and a wrong pick turns red, then
 * a feedback block explains the fact behind the answer. Right or wrong, the
 * user learns something.
 *
 * With `ids` the run is a challenge: those exact questions, in that order,
 * so two people answer the same three things and the scores can be put
 * side by side. `vs` and `vsScore` are who set it and what there is to
 * beat, and they are carried through to the score screen rather than used
 * here. Showing the target mid-run would change how people play it.
 */
export default function QuizPlayScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    ids?: string;
    vs?: string;
    vsScore?: string;
    length?: string;
  }>();

  const ids = params.ids;
  const runLength = Number(params.length);
  const questions = useMemo(
    () =>
      ids === undefined
        ? getQuiz(Number.isFinite(runLength) && runLength > 0 ? runLength : undefined)
        : getQuizByIds(ids.split(',')),
    [ids, runLength],
  );

  const playAnswerSound = useAnswerSounds();

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Not `questions[index]!`: a challenge can name a question the studio
  // has since retired, and `getQuizByIds` drops what it cannot resolve
  // rather than inventing a replacement. That leaves a short run, or an
  // empty one, and both have to render something other than a crash.
  const question = questions[index];
  const fact = question === undefined ? undefined : getFactById(question.factId);
  const family = familyFor(fact?.category ?? 'Culture');

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const answer = useCallback(
    (choice: number) => {
      if (picked !== null || question === undefined) return;

      const isCorrect = choice === question.correctIndex;
      setPicked(choice);
      if (isCorrect) setCorrectCount((n) => n + 1);

      playAnswerSound(isCorrect);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(
          isCorrect
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning,
        );
      }

      const score = correctCount + (isCorrect ? 1 : 0);
      timer.current = setTimeout(() => {
        if (index + 1 < questions.length) {
          setIndex((i) => i + 1);
          setPicked(null);
        } else {
          // Accuracy is over every question ever answered, so the run is
          // recorded on the way to the score rather than on the score
          // screen, which a back gesture can reach twice.
          recordQuizRun(score, questions.map((q) => q.id));
          router.replace({
            pathname: '/quiz/score',
            params: {
              score: String(score),
              total: String(questions.length),
              category: fact?.category ?? 'Culture',
              // The score screen builds the challenge from these, so a
              // run can be passed on exactly as it was played.
              ids: questions.map((q) => q.id).join(','),
              ...(params.vs === undefined ? {} : { vs: params.vs }),
              ...(params.vsScore === undefined ? {} : { vsScore: params.vsScore }),
            },
          });
        }
      }, ADVANCE_DELAY);
    },
    [
      correctCount,
      fact?.category,
      index,
      params.vs,
      params.vsScore,
      picked,
      playAnswerSound,
      question,
      questions,
    ],
  );

  if (question === undefined) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <Text style={[typeScale.headline, styles.emptyText, { color: colors.text }]}>
            These questions have moved on.
          </Text>
          <Text style={[typeScale.body, styles.emptyText, { color: colors.textMuted }]}>
            The challenge you followed points at questions that are no longer in the
            app. A fresh three are waiting.
          </Text>
          <Pressable
            style={[styles.play, { backgroundColor: brandGreen }]}
            onPress={() => router.replace('/quiz/play')}>
            <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Play a new quiz</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[typeScale.caption, styles.counter, { color: colors.textMuted }]}>
          Question {index + 1} of {questions.length}
        </Text>
        {/*
          One segment per question up to eight, then a single bar.

          §4.3 asks for a segmented bar and at three questions that is
          obviously right. At twenty the segments are four pixels wide with
          a gap between them, which reads as a dotted line rather than as
          progress, so past eight it becomes one continuous bar instead.
        */}
        {questions.length <= 8 ? (
          <View style={styles.progress}>
            {questions.map((q, i) => (
              <View
                key={q.id}
                style={[
                  styles.segment,
                  {
                    backgroundColor:
                      i < index ? brandGreen : i === index ? colors.text : colors.border,
                  },
                ]}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: brandGreen,
                  width: `${((index + (picked === null ? 0 : 1)) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>
        )}
      </View>

      <View style={styles.body}>
        {fact && (
          <View style={[styles.pill, { backgroundColor: categoryTint[fact.category] }]}>
            <Text style={[typeScale.eyebrow, { color: family.mid }]}>
              {fact.category.toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={[typeScale.headline, styles.question, { color: colors.text }]}>
          {question.question}
        </Text>

        <View style={styles.options}>
          {question.options.map((option, i) => {
            const isAnswer = i === question.correctIndex;
            const isPicked = i === picked;
            const revealed = picked !== null;

            const border = revealed && isAnswer
              ? feedback.correct
              : revealed && isPicked
                ? feedback.wrong
                : colors.border;
            const fill = revealed && isAnswer
              ? feedback.correctFill
              : revealed && isPicked
                ? feedback.wrongFill
                : colors.background;
            const text = revealed && isAnswer
              ? feedback.correct
              : revealed && isPicked
                ? feedback.wrong
                : colors.text;

            return (
              <Pressable
                key={option}
                onPress={() => answer(i)}
                style={[styles.option, { backgroundColor: fill, borderColor: border }]}>
                <Text style={[typeScale.option, { color: text }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {picked !== null && (
          <View style={[styles.explain, { backgroundColor: categoryTint[fact?.category ?? 'Culture'] }]}>
            <Text style={[typeScale.body, { color: family.dark }]}>{question.explanation}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: metrics.screenPadding, paddingTop: spacing.sm, gap: spacing.md },
  counter: { textAlign: 'center' },
  progress: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  body: { flex: 1, padding: metrics.screenPadding, gap: spacing.lg },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  question: {},
  options: { gap: spacing.md },
  option: { borderRadius: radius.tile, borderWidth: 1.5, padding: spacing.lg },
  explain: { borderRadius: radius.tile, padding: spacing.lg },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: metrics.screenPadding,
  },
  emptyText: { textAlign: 'center' },
  play: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
});
