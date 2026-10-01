import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getSavedFacts,
  imageSource,
  markImageBroken,
  refreshCorpus,
  showsImage,
  toggleSaved,
  useBrokenImages,
  useCorpusVersion,
  useSavedIds,
} from '@/src/data';
import {
  brandGreen,
  familyFor,
  metrics,
  radius,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';
import type { Fact } from '@/src/types';

/**
 * Bookmarked facts as a two-column grid of small cards.
 *
 * Six on a screen, not eight: the tile floor lives in `metrics` and is set
 * so two columns and just under three rows fill a 390x844 phone.
 */
export default function SavedScreen() {
  const { colors } = useTheme();

  // Subscribed for the re-render: this is what makes the tab live, so a
  // fact bookmarked on the feed is already here when you switch across.
  useSavedIds();
  useCorpusVersion();
  const facts = getSavedFacts();

  const [refreshing, setRefreshing] = useState(false);

  /*
    Pull here refreshes the corpus, not the saved list — the list is on
    this device and is already current. What can be stale is the facts
    behind it: a wording fix or a newly approved photograph landing on
    something saved a week ago.
  */
  const refresh = useCallback(() => {
    setRefreshing(true);
    refreshCorpus()
      .catch(() => {
        // Offline. What is on screen came off the device and still stands.
      })
      .finally(() => setRefreshing(false));
  }, []);

  const control = (
    <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textMuted} />
  );

  // Two columns, filled alternately so the grid stays balanced.
  const columns: Fact[][] = [[], []];
  facts.forEach((fact, i) => columns[i % 2].push(fact));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typeScale.screenTitle, { color: colors.text }]}>Saved</Text>
        <Text style={[typeScale.caption, { color: colors.textMuted }]}>
          {facts.length === 1 ? '1 fact' : `${facts.length} facts`}
        </Text>
      </View>

      {facts.length === 0 ? (
        // Scrollable even with nothing in it, or there is no gesture to
        // pull on — an empty screen is exactly where someone tries.
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={control}
          showsVerticalScrollIndicator={false}>
          <Empty />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          refreshControl={control}
          showsVerticalScrollIndicator={false}>
          {columns.map((column, ci) => (
            <View key={ci} style={styles.column}>
              {column.map((fact) => (
                <SavedTile key={fact.id} fact={fact} />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/**
 * A fresh install lands here, and it has to say what to do.
 *
 * This tab used to return the whole corpus, so it was never empty and
 * never needed one. Now that a save is a real save, an empty grid would be
 * the most common first impression of the tab, and an empty grid reads as
 * a broken screen rather than an unused one.
 */
function Empty() {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyMark, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name="bookmark-outline" size={26} color={colors.textMuted} />
      </View>
      <Text style={[typeScale.option, { color: colors.text }]}>Nothing saved yet</Text>
      <Text style={[typeScale.caption, styles.emptyHint, { color: colors.textMuted }]}>
        Tap the bookmark on any fact and it will be waiting here.
      </Text>
    </View>
  );
}

/**
 * Take it off the list.
 *
 * The filled green bookmark rather than a cross, because that is exactly
 * what the rail on the feed card shows once a fact is saved — so this is
 * the same control in the same state, and tapping it does the same thing
 * it does there. A cross would be a second vocabulary for one idea.
 *
 * Its own Pressable inside the tile's: the tile opens the deep dive, and
 * the inner one takes the touch before the outer sees it.
 */
function RemoveButton({ factId, scrim }: { factId: string; scrim: string }) {
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        toggleSaved(factId);
      }}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Remove from saved"
      style={({ pressed }) => [
        styles.remove,
        { backgroundColor: scrim, opacity: pressed ? 0.6 : 1 },
      ]}>
      <Ionicons name="bookmark" size={14} color={brandGreen} />
    </Pressable>
  );
}

function SavedTile({ fact }: { fact: Fact }) {
  const family = familyFor(fact.category);
  useBrokenImages();

  if (showsImage(fact)) {
    return (
      <Pressable
        onPress={() => router.push({ pathname: '/fact/[id]', params: { id: fact.id } })}
        style={[styles.tile, styles.photoTile, { backgroundColor: fact.image.panelColor }]}>
        <Image
          source={imageSource(fact.image.url)}
          style={styles.tileImage}
          contentFit="cover"
          contentPosition="top"
          onError={() => markImageBroken(fact.image.url)}
        />
        <View style={styles.tileOverlay}>
          <Text numberOfLines={4} style={[typeScale.caption, styles.tileText, { color: '#FFFFFF' }]}>
            {fact.fact}
          </Text>
        </View>
        <RemoveButton factId={fact.id} scrim="rgba(0,0,0,0.45)" />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/fact/[id]', params: { id: fact.id } })}
      style={[styles.tile, { backgroundColor: family.light }]}>
      {/* Reserves the corner the remove button sits in. */}
      <Text style={[typeScale.eyebrow, styles.tileEyebrow, { color: family.mid }]}>
        {fact.category.toUpperCase()}
      </Text>
      {/*
        Eight lines, not five. A taller tile with the old cap left dead
        space under the text, and at a median fact of 124 characters eight
        lines is usually the whole thing rather than a teaser.
      */}
      <Text numberOfLines={8} style={[typeScale.caption, styles.tileText, { color: family.dark }]}>
        {fact.fact}
      </Text>
      <RemoveButton factId={fact.id} scrim="rgba(255,255,255,0.55)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: metrics.screenPadding, paddingBottom: spacing.lg },
  /*
    Tighter than the screen's usual margin, on purpose. Two columns of
    tiles have their width set entirely by the space around them, and at
    the standard 20 each tile was a little too narrow for its fact. The
    header keeps the standard margin, so only the tiles reach wider.
  */
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  column: { flex: 1, gap: spacing.sm },
  tile: {
    borderRadius: radius.tile,
    padding: spacing.lg,
    minHeight: metrics.savedTileMinHeight,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  emptyScroll: { flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: metrics.screenPadding,
    gap: spacing.sm,
    // Sits a little above centre: dead centre reads as low once the tab
    // bar is under it.
    paddingBottom: spacing.xxl * 2,
  },
  emptyMark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyHint: { textAlign: 'center', maxWidth: 240 },
  photoTile: { padding: 0, justifyContent: 'flex-end' },
  tileImage: { ...StyleSheet.absoluteFillObject },
  tileOverlay: { padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.45)' },
  tileText: { lineHeight: 18 },
  // Stops "BUSINESS" running under the remove button on a narrow tile.
  tileEyebrow: { paddingRight: 30 },
  remove: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
