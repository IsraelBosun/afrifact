import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChips } from '@/src/components/CategoryChips';
import { FactCard } from '@/src/components/FactCard';
import { FeedActions } from '@/src/components/FeedActions';
import { QuizCard } from '@/src/components/QuizCard';
import { ShareCard } from '@/src/components/ShareCard';
import { TopBar } from '@/src/components/TopBar';
import { FeedEndCard } from '@/src/components/FeedEndCard';
import { NotifyPrompt } from '@/src/components/NotifyPrompt';
import {
  dealPosition,
  getCategoryLanes,
  getFactNumber,
  getFactPool,
  getFeed,
  getTodaysFact,
  getUserStats,
  noteFactSeen,
  useProgress,
  QUIZ_LENGTH,
  refreshCorpus,
  reshuffleFeed,
  setDealPosition,
  toggleSaved,
  useCorpusVersion,
  useCountry,
  useDeal,
  useSavedIds,
  type FeedItem,
} from '@/src/data';
import {
  ASK_DELAY_MS,
  setNotificationsEnabled,
  shouldOfferNotifications,
} from '@/src/notifications';
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
  // From the store, so the picker's choice actually lands here and the
  // launch market is not written into a screen. §10.
  const country = useCountry();
  const listRef = useRef<FlatList<FeedItem>>(null);

  /*
    The saved ids, from the store rather than this screen.

    Subscribing here means the bookmark on a card reflects a save made
    anywhere — including one made on a previous launch, which the old local
    `Record<string, boolean>` could not.
  */
  const saved = useSavedIds();
  const savedSet = useMemo(() => new Set(saved), [saved]);

  const [refreshing, setRefreshing] = useState(false);

  /*
    The daily-facts offer.

    Deliberately on a timer rather than on mount: §10 says the app opens
    into a fact, so the card has to be read before anything is asked of the
    reader. This is our own prompt, not the system one — see
    `notifications/prompt.ts` for why that distinction is what makes
    asking again on the fifth open possible at all.
  */
  const [offer, setOffer] = useState(false);
  const [offerBusy, setOfferBusy] = useState(false);

  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void shouldOfferNotifications().then((should) => {
      if (!live || !should) return;
      timer = setTimeout(() => {
        if (live) setOffer(true);
      }, ASK_DELAY_MS);
    });
    return () => {
      live = false;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);

  const acceptOffer = useCallback(async () => {
    setOfferBusy(true);
    try {
      // This is where the one system prompt is finally spent.
      await setNotificationsEnabled(true, getFactPool());
    } finally {
      setOfferBusy(false);
      setOffer(false);
    }
  }, []);

  /*
    Subscribed for the re-render, not for the value.

    The streak flame in the top bar is real now, and it goes up the moment
    the first card of a new day settles — which happens on this screen.
    Without the subscription the flame would show yesterday's number until
    something else happened to re-render the feed.

    Not memoised: it reads module state that these subscriptions are what
    actually invalidate, so any dependency array here would be a claim the
    linter is right to disbelieve.
  */
  useProgress();
  const stats = getUserStats();

  /*
    Bumped when a refresh replaces the corpus, which is the other way this
    list's contents can change without any prop moving.

    The rule is switched off for one line rather than obeyed. `getFeed`
    reads module state, so the linter sees a call with no inputs and calls
    the version unnecessary — it is in fact the only thing that invalidates
    it. Dropping the memo instead is not an option here: a fresh array
    every render remounts every row of a paged list.
  */
  const corpusVersion = useCorpusVersion();
  // The dealt order. Changes when the shuffle button re-deals, and when a
  // refresh adds or removes facts.
  const deal = useDeal();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lanes = useMemo(() => getCategoryLanes(country), [country, corpusVersion]);

  /*
    Derived rather than corrected in an effect.

    Lanes are scoped to the country, so switching countries can strip the
    lane you were reading out from under you. Falling back here means the
    chips and the feed can never disagree, and there is no frame where the
    screen is asking for a category this country does not have.
  */
  const activeLane = lanes.includes(lane) ? lane : 'For You';

  const items = useMemo(
    () => getFeed({ country, category: activeLane }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [country, activeLane, deal, corpusVersion],
  );

  /*
    Where to open.

    Resumed by fact id, not by index. The deal now survives a relaunch, so
    without this the app would reopen on card 1 every morning and the
    numbering would be a countdown nobody ever finished. Reading the stored
    id once per mount is deliberate: it is a starting point, not a binding,
    and re-reading it would fight the reader's own scrolling.
  */
  const initialIndex = useMemo(() => {
    const at = dealPosition();
    if (at === null) return 0;
    const found = items.findIndex((item) => item.kind === 'fact' && item.fact.id === at);
    return found > 0 ? found : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

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

  // Which card settled under the reader, recorded so the next launch can
  // resume there. A paged list, so this is one call per card rather than
  // per frame. Declared here because it needs `pageHeight`.
  const onSettled = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageHeight <= 0) return;
      const index = Math.round(event.nativeEvent.contentOffset.y / pageHeight);
      const item = items[index];
      if (item?.kind === 'fact') {
        setDealPosition(item.fact.id);
        // Settled under the thumb, not merely scrolled past: this is what
        // "facts learned" counts, and what marks the day for the streak.
        noteFactSeen(item.fact.id);
      }
    },
    [items, pageHeight],
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

  const onToggleSave = useCallback((id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleSaved(id);
  }, []);

  const selectLane = useCallback((next: string) => {
    setLane(next);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  /** The two on the action row that leave the feed rather than rearrange it. */
  const openSearch = useCallback(() => router.push('/search'), []);

  const openToday = useCallback(() => {
    const fact = getTodaysFact();
    if (!fact) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/fact/[id]', params: { id: fact.id } });
  }, []);

  /*
    Deal again.

    Back to the top, always: a new order with the reader left on page 40
    would look like the app had lost their place rather than reshuffled.
    The seed is time-based so pressing it twice never gives the same hand.
  */
  const reshuffle = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    reshuffleFeed();
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  /*
    Pull to refresh: go back to the database, not to the cache.

    The cached corpus is normally good for six hours and refreshes behind
    you for the next launch, which is right when nobody asked. When someone
    pulls, they are asking, so this one lands in the session they are in.
  */
  const refresh = useCallback(() => {
    setRefreshing(true);
    refreshCorpus()
      .then(() => {
        // The refresh puts the run back to Fact #1, so the list has to go
        // with it — landing on card 40 of an order that just changed is
        // how a reader loses their place without being told.
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      })
      .catch(() => {
        // Offline, most likely. The cached corpus is still on screen and
        // still correct, so there is nothing to say and nothing to undo.
      })
      .finally(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <TopBar
        countryCode={country}
        streak={stats.dayStreak}
        onPressCountry={() => router.push('/country')}
      />
      <CategoryChips lanes={lanes} active={activeLane} onSelect={selectLane} />

      {/*
        The gap between the chips and the card was doing nothing. The card
        is capped by aspect ratio and centred in its page, so this row eats
        slack rather than the fact.
      */}
      <FeedActions
        onShuffle={reshuffle}
        onToday={openToday}
        onRefresh={refresh}
        onSearch={openSearch}
        refreshing={refreshing}
      />

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
            refreshing={refreshing}
            onRefresh={refresh}
            keyExtractor={(item, i) =>
              item.kind === 'fact'
                ? item.fact.id
                : item.kind === 'quiz'
                  ? `quiz-${item.seenCount}-${i}`
                  : 'end'
            }
            initialScrollIndex={initialIndex}
            onMomentumScrollEnd={onSettled}
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
                      number={item.number}
                      saved={savedSet.has(item.fact.id)}
                      onSave={() => onToggleSave(item.fact.id)}
                      onShare={() => shareFact(item.fact)}
                      onSparkle={() =>
                        router.push({ pathname: '/fact/[id]', params: { id: item.fact.id } })
                      }
                      onAdvance={() => advance(index)}
                    />
                  ) : item.kind === 'quiz' ? (
                    <QuizCard
                      seenCount={item.seenCount}
                      questionCount={QUIZ_LENGTH}
                      onPlay={() => router.push('/quiz/play')}
                    />
                  ) : (
                    <FeedEndCard total={item.total} onShuffle={reshuffle} />
                  )}
                </View>
              </View>
            )}
          />
        )}
      </View>

      {offer && (
        <NotifyPrompt
          busy={offerBusy}
          onAccept={() => void acceptOffer()}
          onDismiss={() => setOffer(false)}
        />
      )}

      {shareTarget &&
        shareView(
          <ShareCard
            fact={shareTarget}
            number={getFactNumber(shareTarget.id)}
            onReady={markReady}
          />,
        )}
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
