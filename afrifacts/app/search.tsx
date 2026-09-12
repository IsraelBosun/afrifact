import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { searchFacts } from '@/src/data';
import {
  categoryColors,
  categoryTint,
  metrics,
  radius,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';
import type { Category } from '@/src/types';

/**
 * Find one fact.
 *
 * Anchored to the TOP rather than the bottom, unlike the country sheet.
 * The field is focused the moment this opens, so the keyboard is already
 * up: a bottom sheet would put the results behind it. From the top, the
 * keyboard covers only the scrim, and the scrim is the dismiss target
 * anyway.
 *
 * The whole corpus is in memory, so there is no debounce, no spinner and
 * no empty "searching" state — results land on the keystroke.
 */
export default function SearchScreen() {
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState('');

  const hits = useMemo(() => searchFacts(query), [query]);
  const typed = query.trim().length > 0;

  /*
    Replace rather than push.

    This screen is a modal over the feed. Pushing the deep dive on top of
    it would leave the search panel underneath, so backing out of a fact
    would land on a stale result list instead of the feed the reader came
    from.
  */
  function open(id: string) {
    router.replace({ pathname: '/fact/[id]', params: { id } });
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={[styles.panel, { backgroundColor: colors.background }]}>
        <View style={styles.head}>
          <View
            style={[
              styles.field,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}>
            <Ionicons name="search" size={17} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
              autoCorrect={false}
              placeholder="A name, a place, or a number"
              placeholderTextColor={colors.textFaint}
              style={[typeScale.option, styles.input, { color: colors.text }]}
            />
            {typed && (
              <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear">
                <Ionicons name="close-circle" size={17} color={colors.textFaint} />
              </Pressable>
            )}
          </View>

          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button">
            <Text style={[typeScale.label, { color: colors.textMuted }]}>Cancel</Text>
          </Pressable>
        </View>

        <ScrollView
          // Without this a tap on a result only dismisses the keyboard and
          // the reader has to tap the same row twice.
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {!typed && (
            <Text style={[typeScale.caption, styles.hint, { color: colors.textMuted }]}>
              Every fact has a number that is the same on every phone. Type “57” to go straight
              to Fact #57.
            </Text>
          )}

          {typed && hits.length === 0 && (
            <Text style={[typeScale.caption, styles.hint, { color: colors.textMuted }]}>
              Nothing matched “{query.trim()}”.
            </Text>
          )}

          {hits.slice(0, 40).map(({ fact, number }) => {
            const family = categoryColors[fact.category as Category] ?? categoryColors.Culture;
            // The pale tints are drawn for a light ground; on dark they
            // would be four bright slabs behind body text.
            const fill = isDark ? colors.surface : categoryTint[fact.category as Category];

            return (
              <Pressable
                key={fact.id}
                onPress={() => open(fact.id)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.hit,
                  { backgroundColor: fill, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.hitHead}>
                  <Text style={[typeScale.eyebrow, { color: family.mid }]}>
                    {fact.category.toUpperCase()}
                  </Text>
                  <Text style={[typeScale.caption, styles.number, { color: colors.textMuted }]}>
                    #{number}
                  </Text>
                </View>
                <Text
                  style={[typeScale.option, { color: isDark ? colors.text : family.dark }]}
                  numberOfLines={3}>
                  {fact.fact}
                </Text>
              </Pressable>
            );
          })}

          {hits.length > 40 && (
            <Text style={[typeScale.caption, styles.hint, { color: colors.textMuted }]}>
              {hits.length - 40} more. Try another word to narrow it.
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Below the panel, so tapping the feed you can still see closes this. */}
      <Pressable style={styles.scrim} onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  panel: {
    maxHeight: '78%',
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
    paddingHorizontal: metrics.screenPadding,
    paddingBottom: spacing.md,
  },
  scrim: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  // Android centres the text against a taller line box without this.
  input: { flex: 1, padding: 0 },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  hint: { paddingVertical: spacing.md },
  hit: {
    borderRadius: radius.tile,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  hitHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  number: { fontVariant: ['tabular-nums'] },
});
