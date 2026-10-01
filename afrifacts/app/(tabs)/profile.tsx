import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/auth';
import { DailyFactsSection } from '@/src/components/DailyFactsSection';
import { ThemePicker } from '@/src/components/ThemePicker';
import {
  getUserProfile,
  getUserStats,
  nameFor,
  setDisplayName,
  useProgress,
  useSavedIds,
} from '@/src/data';
import {
  amber,
  brandGreen,
  categoryColors,
  metrics,
  radius,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Off until Premium exists: a card whose button does nothing is a broken promise. */
const SHOW_PREMIUM = false;

/*
  Facts read before the account card appears. Offering an account on a
  blank first launch asks a stranger to sign up for nothing; offering it
  once there is a streak to lose is a real offer.
*/
const OFFER_AFTER_FACTS = 5;

function joinedLabel(iso: string): string {
  if (iso.length === 0) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'long' });
}

export default function ProfileScreen() {
  const { colors } = useTheme();

  /*
    Subscribed for the re-render, not for the values.

    Every number on this screen is now read from module state at render
    time, so these are what make the screen agree with the rest of the app:
    `useSavedIds` for the SAVED card, `useProgress` for the other three and
    the week row. Without them the profile would show whatever was true the
    last time it happened to remount.
  */
  useSavedIds();
  const record = useProgress();
  const auth = useAuth();
  const profile = getUserProfile();
  const stats = getUserStats();

  // The profile asks for a name rather than inventing one, signed in or
  // not. Tapping the name (or the prompt) opens the field; a signed-in
  // name travels with the account.
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function beginEdit() {
    setDraft(profile.name);
    setEditing(true);
  }

  function commitEdit() {
    setDisplayName(draft);
    setEditing(false);
  }

  const named = profile.name.length > 0;
  const initials = named ? profile.name.slice(0, 2).toUpperCase() : '';
  const joined = joinedLabel(profile.joinedAt);
  const offerAccount =
    auth.available && !auth.loading && !auth.signedIn && record.seen.length >= OFFER_AFTER_FACTS;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: categoryColors.Business.light }]}>
            {named ? (
              <Text style={[typeScale.screenTitle, { color: categoryColors.Business.mid }]}>
                {initials}
              </Text>
            ) : (
              <Ionicons name="person" size={22} color={categoryColors.Business.mid} />
            )}
          </View>

          <View style={styles.identityText}>
            {editing ? (
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={commitEdit}
                onBlur={commitEdit}
                autoFocus
                maxLength={40}
                returnKeyType="done"
                placeholder="Your name"
                placeholderTextColor={colors.textFaint}
                style={[
                  typeScale.screenTitle,
                  styles.nameInput,
                  { color: colors.text, borderBottomColor: colors.border },
                ]}
              />
            ) : (
              <Pressable onPress={beginEdit} accessibilityRole="button" hitSlop={4}>
                <Text
                  style={[typeScale.screenTitle, { color: named ? colors.text : colors.textMuted }]}>
                  {named ? profile.name : 'Add your name'}
                </Text>
              </Pressable>
            )}

            {/*
              The country comes from the picker, never from a literal. §10:
              country is a data value, and "Learning Nigeria" hardcoded here
              was the launch market written into a screen.
            */}
            <Text style={[typeScale.caption, { color: colors.textMuted }]}>
              Learning {nameFor(profile.country)}
              {joined.length > 0 ? ` · joined ${joined}` : ''}
            </Text>
          </View>

          {/* The only way into settings. The profile is where people look. */}
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={({ pressed }) => [
              styles.gear,
              { backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.7 : 1 },
            ]}>
            <Ionicons name="settings-outline" size={19} color={colors.text} />
          </Pressable>
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
          {/*
            A dash, not 0%, until a question has been answered. Zero is a
            score; "not played yet" is not, and showing 0% to someone who
            has never opened the quiz reads as a failure they did not earn.
          */}
          <StatCard
            label="QUIZ ACCURACY"
            value={stats.quizAnswered === 0 ? '—' : `${stats.quizAccuracy}%`}
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

        {offerAccount && (
          <Pressable
            onPress={() => router.push('/auth/sign-in')}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.save,
              { borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
            ]}>
            <View style={[styles.saveIcon, { backgroundColor: categoryColors.Culture.light }]}>
              <Ionicons name="cloud-upload-outline" size={18} color={categoryColors.Culture.dark} />
            </View>
            <View style={styles.identityText}>
              <Text style={[typeScale.option, { color: colors.text }]}>Save your progress</Text>
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>
                Keep your streak and saves if you change phones
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={brandGreen} />
          </Pressable>
        )}

        {/*
          The two settings people actually change, where they already look.
          Account and About stay behind the gear.
        */}
        <DailyFactsSection />
        <ThemePicker />

        {/* An invitation, never a wall or an interruption. */}
        {SHOW_PREMIUM && (
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
        )}
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
  // Underlined while editing so the tap clearly landed in a field, without
  // the name changing size between the two states.
  nameInput: { borderBottomWidth: 1, paddingVertical: 0, paddingBottom: 2 },
  identityText: { flex: 1, gap: 2 },
  gear: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
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
  save: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.tile,
    padding: spacing.lg,
  },
  saveIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
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
