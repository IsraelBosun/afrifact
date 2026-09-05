import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUserProfile, getUserStats } from '@/src/data';
import {
  amber,
  categoryColors,
  metrics,
  radius,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function joinedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'long' });
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const profile = useMemo(() => getUserProfile(), []);
  const stats = useMemo(() => getUserStats(), []);

  const initials = profile.name.slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: categoryColors.Business.light }]}>
            <Text style={[typeScale.screenTitle, { color: categoryColors.Business.mid }]}>
              {initials}
            </Text>
          </View>
          <View style={styles.identityText}>
            <Text style={[typeScale.screenTitle, { color: colors.text }]}>{profile.name}</Text>
            <Text style={[typeScale.caption, { color: colors.textMuted }]}>
              Learning Nigeria · joined {joinedLabel(profile.joinedAt)}
            </Text>
          </View>
        </View>

        {/* Four stat cards, each in a different category colour family. */}
        <View style={styles.statGrid}>
          <StatCard label="DAY STREAK" value={String(stats.dayStreak)} family={amber} />
          <StatCard
            label="FACTS LEARNED"
            value={String(stats.factsLearned)}
            family={categoryColors.Culture}
          />
          <StatCard
            label="SAVED"
            value={String(stats.savedCount)}
            family={categoryColors.Food}
          />
          <StatCard
            label="QUIZ ACCURACY"
            value={`${stats.quizAccuracy}%`}
            family={categoryColors.Sports}
          />
        </View>

        <View style={styles.week}>
          <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>THIS WEEK</Text>
          <View style={styles.weekRow}>
            {stats.week.map((kept, i) => (
              <View key={i} style={styles.day}>
                <View
                  style={[
                    styles.dayDot,
                    { backgroundColor: kept ? amber.light : colors.surfaceAlt },
                  ]}>
                  <Ionicons
                    name="flame"
                    size={15}
                    color={kept ? amber.dark : colors.textFaint}
                  />
                </View>
                <Text style={[typeScale.caption, { color: colors.textMuted }]}>
                  {DAY_LABELS[i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* An invitation, never a wall or an interruption. */}
        <View style={[styles.premium, { backgroundColor: categoryColors.Business.dark }]}>
          <Text style={[typeScale.screenTitle, { color: '#FFFFFF' }]}>AfriFacts Premium</Text>
          <Text style={[typeScale.body, { color: categoryColors.Business.light }]}>
            Unlimited AI questions, no ads, full quiz packs and offline mode.
          </Text>
          <Pressable style={styles.premiumBtn}>
            <Text style={[typeScale.label, { color: categoryColors.Business.dark }]}>
              Try it free
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  family,
}: {
  label: string;
  value: string;
  family: { light: string; mid: string; dark: string };
}) {
  return (
    <View style={[styles.stat, { backgroundColor: family.light }]}>
      <Text style={[typeScale.statFigure, { color: family.dark }]}>{value}</Text>
      <Text style={[typeScale.eyebrow, { color: family.mid }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: metrics.screenPadding, gap: spacing.xl, paddingBottom: spacing.xxl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  identityText: { flex: 1, gap: 2 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: radius.tile,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  week: { gap: spacing.md },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: spacing.xs },
  dayDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  premium: { borderRadius: radius.card, padding: spacing.xl, gap: spacing.md },
  premiumBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
});
