import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChips } from '@/src/components/CategoryChips';
import { FactCard } from '@/src/components/FactCard';
import { QuizCard } from '@/src/components/QuizCard';
import { ShareCard } from '@/src/components/ShareCard';
import { TopBar } from '@/src/components/TopBar';
import { getCategoryLanes, getFeed, getUserStats, type FeedItem } from '@/src/data';
import { useShareCard } from '@/src/share/useShareCard';
import { metrics, spacing, useTheme } from '@/src/theme';
import type { Fact } from '@/src/types';

/**
 * Home IS the feed. The app opens directly into a full screen fact,
 * zero clicks to value: no dashboard, no welcome, no signup wall.
 *
 * Swipe is vertical and paged, TikTok style. Tapping a card also advances.
 */
export default function HomeScreen() {
  const { colors } = useTheme();

  const [lane, setLane] = useState('For You');
  const [country] = useState('NG');
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const listRef = useRef<FlatList<FeedItem>>(null);

  const lanes = useMemo(() => getCategoryLanes(), []);
  const stats = useMemo(() => getUserStats(), []);
  const items = useMemo(() => getFeed({ country, category: lane }), [country, lane]);

  // Chips, top bar and tab bar sit outside the card, so a page is what is left.
  const [pageHeight, setPageHeight] = useState(0);

  /*
    A page is the full swipe unit; the card inside it is capped.

    Letting the card fill the page makes it a column rather than a card on
    a tall phone. Capping it against its own width and centring the
    remainder gives it air above and below, and the cap only ever shrinks
    the card — on a short screen the page height still wins.
  */
  const { width } = useWindowDimensions();
  const cardHeight = Math.min(
    pageHeight - spacing.md,
    (width - metrics.screenPadding * 2) / metrics.feedCardMaxAspect,
  );

  // One offscreen share card, retargeted at whichever fact is being shared,
  // rather than one mounted per row.
  const { shareView, share, prepare, markReady } = useShareCard();
  const [shareTarget, setShareTarget] = useState<Fact | null>(null);

  const shareFact = useCallback(
    async (fact: Fact) => {
      /*
        One offscreen card is retargeted at whichever fact is being shared,
        so the snapshot has to wait for that fact's photograph — not for a
        fixed number of frames. Two frames was enough for React to commit
        and lay out, and nowhere near enough for a remote image to arrive,
        which is how an export once went out carrying one fact's words over
        the previous fact's photo.

        Warming the cache first means the card usually paints immediately;
        `prepare()` is what guarantees it before the capture either way.
      */
      if (fact.image) {
        await Image.prefetch(fact.image.url).catch(() => undefined);
      }

      const ready = prepare();
      setShareTarget(fact);
      await ready;

      await share({ dialogTitle: 'Share this fact' });
    },
    [share, prepare],
  );

  const advance = useCallback(
    (index: number) => {
      if (index + 1 < items.length) {
        listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      }
    },
    [items.length],
  );

  const toggleSave = useCallback((id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSaved((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const selectLane = useCallback((next: string) => {
    setLane(next);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <TopBar
        countryCode={country}
        streak={stats.dayStreak}
        onPressCountry={() => router.push('/country')}
      />
      <CategoryChips lanes={lanes} active={lane} onSelect={selectLane} />

      {/*
        The page height is measured rather than derived, because the chips
        and tab bar above and below it vary by device. onLayout can fire
        before those settle, so we keep the largest height seen.
      */}
      <View
        style={styles.feed}
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height);
          if (h > 0 && h !== pageHeight) setPageHeight(h);
        }}>
        {pageHeight > 0 && (
          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={(item, i) =>
              item.kind === 'fact' ? item.fact.id : `quiz-${item.seenCount}-${i}`
            }
            style={styles.list}
            pagingEnabled
            snapToInterval={pageHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, index) => ({
              length: pageHeight,
              offset: pageHeight * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <View style={[styles.page, { height: pageHeight }]}>
                <View style={{ height: cardHeight }}>
                  {item.kind === 'fact' ? (
                    <FactCard
                      fact={item.fact}
                      saved={!!saved[item.fact.id]}
                      onSave={() => toggleSave(item.fact.id)}
                      onShare={() => shareFact(item.fact)}
                      onSparkle={() =>
                        router.push({ pathname: '/fact/[id]', params: { id: item.fact.id } })
                      }
                      onAdvance={() => advance(index)}
                    />
                  ) : (
                    <QuizCard seenCount={item.seenCount} onPlay={() => router.push('/quiz/play')} />
                  )}
                </View>
              </View>
            )}
          />
        )}
      </View>

      {shareTarget && shareView(<ShareCard fact={shareTarget} onReady={markReady} />)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  feed: { flex: 1, paddingHorizontal: metrics.screenPadding, paddingTop: spacing.xs },
  list: { flex: 1 },
  // The card is centred in the page rather than filling it, so the space
  // the cap frees up falls evenly above and below.
  page: { justifyContent: 'center' },
});
