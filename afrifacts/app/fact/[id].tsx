import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShareCard } from '@/src/components/ShareCard';
import { SourceLink } from '@/src/components/SourceLink';
import { VerifiedLine } from '@/src/components/VerifiedLine';
import { getFactById, getFactNumber, getRelatedFacts } from '@/src/data';
import { useShareCard } from '@/src/share/useShareCard';
import { familyFor, metrics, radius, spacing, type as typeScale, useTheme } from '@/src/theme';
import { hasImage } from '@/src/types';

/** The hero image, and the distance the header bar floats over before it lands. */
const HERO_HEIGHT = 200;

/**
 * The fact expanded into a short article.
 *
 * Deep colour is for the cover, not the paragraphs: the hero and its title
 * panel carry the category family, then the body switches to a light
 * reading surface.
 */
export default function DeepDiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');

  /*
    Whether the hero has left the top of the screen.

    Only the status bar cares. Over the hero the top of the screen is a
    photograph or a mid-tone colour block and the icons have to be light
    whatever the theme is; past it the top is the page again and they
    follow the theme like everywhere else. This is the one thing on this
    screen that cannot be interpolated, because a status bar style is a
    native mode rather than a value.
  */
  const [pastHero, setPastHero] = useState(false);

  /*
    How far down the article we are, for the header bar.

    Back and share sit above the scroll rather than inside it — an article
    is the one screen where the way out should not require scrolling back
    to the top to find it. Over the hero they are white on the photo's own
    scrim; past it they would be two dark discs floating on cream, so the
    bar fades in a solid ground underneath them as the hero leaves.

    Native driver: this is opacity only, so the fade runs on the UI thread
    and does not stutter behind a fast flick.
  */
  const scrollY = useRef(new Animated.Value(0)).current;
  const barOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 80, HERO_HEIGHT - 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  /*
    One handler feeding both. The animated value goes native for the fade;
    the `listener` is how JS still sees the offset without a second
    onScroll. It sets state only on the crossing — React bails out of the
    render when the boolean is unchanged — so a flick costs one re-render,
    not sixty.
  */
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const past = event.nativeEvent.contentOffset.y > HERO_HEIGHT - 50;
          setPastHero((prev) => (prev === past ? prev : past));
        },
      }),
    [scrollY],
  );

  const fact = useMemo(() => getFactById(id), [id]);
  const related = useMemo(() => (id ? getRelatedFacts(id) : []), [id]);

  // Called before the missing-fact return, so the hook order stays stable.
  const { shareView, share, sharing, prepare, markReady } = useShareCard();

  /*
    Unlike the feed, this card is mounted with one fact for the life of the
    screen, so its photograph has usually decoded long before anyone taps
    share. Latching that means the common path costs nothing — `prepare()`
    is only awaited when the image genuinely has not arrived yet, rather
    than making every share sit out a timeout.
  */
  const cardReady = useRef(false);
  const onCardReady = useCallback(() => {
    cardReady.current = true;
    markReady();
  }, [markReady]);

  const shareThis = useCallback(async () => {
    const url = fact?.image?.url;
    if (url) await Image.prefetch(url).catch(() => undefined);
    if (!cardReady.current) await prepare();
    await share({ dialogTitle: 'Share this fact' });
  }, [fact?.image?.url, prepare, share]);

  if (!fact) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[typeScale.body, styles.missing, { color: colors.textMuted }]}>
          That fact is not available.
        </Text>
      </SafeAreaView>
    );
  }

  const family = familyFor(fact.category);
  const panelColor = hasImage(fact) ? fact.image.panelColor : family.dark;

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      {/* Overrides the root bar for as long as this screen is mounted. */}
      <StatusBar style={pastHero ? (isDark ? 'light' : 'dark') : 'light'} />

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}>
        {/* Hero: the image when there is one, otherwise the category colour block. */}
        <View style={[styles.hero, { backgroundColor: hasImage(fact) ? panelColor : family.mid }]}>
          {hasImage(fact) && (
            <>
              <Image
                source={{ uri: fact.image.url }}
                style={styles.heroImage}
                contentFit="cover"
                contentPosition="top"
              />
              {/* A photo credit never leaves the image. It is a licence requirement. */}
              <View style={styles.credit}>
                <Text style={styles.creditText}>{fact.image.credit}</Text>
              </View>
            </>
          )}
        </View>

        <View style={[styles.titlePanel, { backgroundColor: panelColor }]}>
          <Text style={[typeScale.eyebrow, { color: family.light }]}>
            {fact.category.toUpperCase()} · DEEP DIVE
          </Text>
          <Text style={[typeScale.factTitle, styles.title, { color: '#FFFFFF' }]}>{fact.fact}</Text>
          <VerifiedLine
            source={fact.source.name}
            url={fact.source.url}
            color={family.light}
            readTime={fact.deepDive.readTime}
          />
        </View>

        <View style={styles.body}>
          {fact.deepDive.body.map((para, i) => (
            <Text key={i} style={[typeScale.article, { color: colors.text }]}>
              {para}
            </Text>
          ))}

          {/* The signature block of every deep dive. */}
          <View style={[styles.callout, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>WHY IT MATTERS</Text>
            <Text style={[typeScale.article, { color: colors.text }]}>
              {fact.deepDive.whyItMatters}
            </Text>
          </View>

          {/*
            The source, openable. The verified line above is a signal; this
            is the evidence behind it, and a badge nobody can check is not
            evidence at all.
          */}
          <SourceLink source={fact.source} />

          {related.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push({ pathname: '/fact/[id]', params: { id: r.id } })}
              style={[
                styles.related,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}>
              <View style={[styles.dot, { backgroundColor: familyFor(r.category).mid }]} />
              <Text style={[typeScale.option, styles.relatedText, { color: colors.text }]}>
                {r.fact}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.ScrollView>

      {/*
        Back and share, pinned. `box-none` so the gap between them is still
        the article: only the two buttons take touches, and a flick that
        starts up here scrolls as it would anywhere else.
      */}
      <View style={styles.headerBar} pointerEvents="box-none">
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.headerFill,
            { backgroundColor: colors.surface, borderBottomColor: colors.border, opacity: barOpacity },
          ]}
        />
        <SafeAreaView edges={['top']} style={styles.heroBar}>
          <Pressable onPress={() => router.back()} style={styles.heroBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={() => void shareThis()}
            disabled={sharing}
            accessibilityRole="button"
            accessibilityLabel="Share this fact"
            style={styles.heroBtn}
            hitSlop={8}>
            <Ionicons name="share-social" size={18} color="#FFFFFF" />
          </Pressable>
        </SafeAreaView>
      </View>

      {/* Ask about this. Phase 1 is UI only: send does nothing yet. */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/*
          Plain View with the inset applied by hand rather than a bottom
          SafeAreaView, so the gap under the input is one readable number
          instead of a device inset and a padding that may or may not add
          up. The input used to sit on the very edge of the screen.
        */}
        <View
          style={[
            styles.ask,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}>
          <View style={styles.askHead}>
            <View style={styles.askLabel}>
              <Ionicons name="sparkles" size={14} color={colors.text} />
              <Text style={[typeScale.label, { color: colors.text }]}>Ask about this</Text>
            </View>
            <View style={[styles.quota, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>2 free left</Text>
            </View>
          </View>

          <View style={styles.askRow}>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder={fact.deepDive.suggestedQuestion}
              placeholderTextColor={colors.textFaint}
              style={[
                typeScale.option,
                styles.input,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send question"
              style={({ pressed }) => [
                styles.send,
                { backgroundColor: panelColor, opacity: pressed ? 0.7 : 1 },
              ]}>
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {shareView(
        <ShareCard fact={fact} number={getFactNumber(fact.id)} onReady={onCardReady} />,
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  missing: { padding: metrics.screenPadding },
  hero: { height: HERO_HEIGHT },
  heroImage: { ...StyleSheet.absoluteFillObject },
  headerBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerFill: { borderBottomWidth: StyleSheet.hairlineWidth },
  heroBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.screenPadding,
    paddingBottom: spacing.sm,
  },
  heroBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  credit: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.chip,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  creditText: { color: '#FFFFFF', fontSize: 10 },
  titlePanel: { padding: metrics.screenPadding, gap: spacing.sm },
  title: { marginTop: spacing.xs },
  body: { padding: metrics.screenPadding, gap: spacing.lg },
  callout: { borderRadius: radius.tile, padding: spacing.lg, gap: spacing.sm },
  related: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.tile,
    borderWidth: 1,
    padding: spacing.lg,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  relatedText: { flex: 1 },
  ask: {
    borderTopWidth: 1,
    paddingHorizontal: metrics.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  askHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  askLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  quota: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  askRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  send: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
