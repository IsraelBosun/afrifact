import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getQuiz, getUserStats } from '@/src/data';
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
  const questions = useMemo(() => getQuiz(), []);
  const stats = useMemo(() => getUserStats(), []);
  const family = categoryColors.Culture;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.body}>
        <View style={[styles.card, { backgroundColor: family.light }]}>
          <Text style={[typeScale.eyebrow, { color: deepGreen }]}>DAILY QUIZ</Text>
          <Text style={[typeScale.headline, { color: family.dark }]}>
            {questions.length} questions, under 30 seconds.
          </Text>
          <Text style={[typeScale.body, { color: family.mid }]}>
            Right or wrong, every answer explains the fact behind it.
          </Text>

          <Pressable
            style={[styles.play, { backgroundColor: family.dark }]}
            onPress={() => router.push('/quiz/play')}>
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Play now</Text>
          </Pressable>
        </View>

        <View style={[styles.accuracy, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[typeScale.statFigure, { color: colors.text }]}>{stats.quizAccuracy}%</Text>
          <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>QUIZ ACCURACY</Text>
        </View>
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
  accuracy: { borderRadius: radius.tile, padding: spacing.xl, gap: spacing.xs },
});
