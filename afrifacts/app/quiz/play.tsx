import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getFactById, getQuiz } from '@/src/data';
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
 */
export default function QuizPlayScreen() {
  const { colors } = useTheme();
  const questions = useMemo(() => getQuiz(), []);

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = questions[index];
  const fact = getFactById(question.factId);
  const family = familyFor(fact?.category ?? 'Culture');

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const answer = useCallback(
    (choice: number) => {
      if (picked !== null) return;

      const isCorrect = choice === question.correctIndex;
      setPicked(choice);
      if (isCorrect) setCorrectCount((n) => n + 1);

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
          router.replace({
            pathname: '/quiz/score',
            params: {
              score: String(score),
              total: String(questions.length),
              category: fact?.category ?? 'Culture',
            },
          });
        }
      }, ADVANCE_DELAY);
    },
    [correctCount, fact?.category, index, picked, question.correctIndex, questions.length],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[typeScale.caption, styles.counter, { color: colors.textMuted }]}>
          Question {index + 1} of {questions.length}
        </Text>
        {/* Segmented progress: one bar per question, filled as you go. */}
        <View style={styles.progress}>
          {questions.map((q, i) => (
            <View
              key={q.id}
              style={[
                styles.segment,
                { backgroundColor: i < index ? brandGreen : i === index ? colors.text : colors.border },
              ]}
            />
          ))}
        </View>
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
});
