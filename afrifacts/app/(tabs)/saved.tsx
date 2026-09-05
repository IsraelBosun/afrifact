import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getSavedFacts } from '@/src/data';
import { familyFor, metrics, radius, spacing, type as typeScale, useTheme } from '@/src/theme';
import { hasImage, type Fact } from '@/src/types';

/** Bookmarked facts as a two-column grid of small cards. */
export default function SavedScreen() {
  const { colors } = useTheme();
  const facts = useMemo(() => getSavedFacts(), []);

  // Two columns, filled alternately so the grid stays balanced.
  const columns: Fact[][] = [[], []];
  facts.forEach((fact, i) => columns[i % 2].push(fact));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typeScale.screenTitle, { color: colors.text }]}>Saved</Text>
        <Text style={[typeScale.caption, { color: colors.textMuted }]}>
          {facts.length} facts
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {columns.map((column, ci) => (
          <View key={ci} style={styles.column}>
            {column.map((fact) => (
              <SavedTile key={fact.id} fact={fact} />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SavedTile({ fact }: { fact: Fact }) {
  const family = familyFor(fact.category);

  if (hasImage(fact)) {
    return (
      <Pressable
        onPress={() => router.push({ pathname: '/fact/[id]', params: { id: fact.id } })}
        style={[styles.tile, styles.photoTile, { backgroundColor: fact.image.panelColor }]}>
        <Image source={{ uri: fact.image.url }} style={styles.tileImage} contentFit="cover" />
        <View style={styles.tileOverlay}>
          <Text numberOfLines={3} style={[typeScale.caption, styles.tileText, { color: '#FFFFFF' }]}>
            {fact.fact}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/fact/[id]', params: { id: fact.id } })}
      style={[styles.tile, { backgroundColor: family.light }]}>
      <Text style={[typeScale.eyebrow, { color: family.mid }]}>
        {fact.category.toUpperCase()}
      </Text>
      <Text numberOfLines={5} style={[typeScale.caption, styles.tileText, { color: family.dark }]}>
        {fact.fact}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: metrics.screenPadding, paddingBottom: spacing.lg },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: metrics.screenPadding,
    paddingBottom: spacing.xl,
  },
  column: { flex: 1, gap: spacing.md },
  tile: {
    borderRadius: radius.tile,
    padding: spacing.lg,
    minHeight: 150,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  photoTile: { padding: 0, justifyContent: 'flex-end' },
  tileImage: { ...StyleSheet.absoluteFillObject },
  tileOverlay: { padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.45)' },
  tileText: { lineHeight: 18 },
});
