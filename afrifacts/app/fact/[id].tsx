import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShareCard } from '@/src/components/ShareCard';
import { SourceLink } from '@/src/components/SourceLink';
import { VerifiedLine } from '@/src/components/VerifiedLine';
import { getFactById, getRelatedFacts } from '@/src/data';
import { useShareCard } from '@/src/share/useShareCard';
import { familyFor, metrics, radius, spacing, type as typeScale, useTheme } from '@/src/theme';
import { hasImage } from '@/src/types';

/**
 * The fact expanded into a short article.
 *
 * Deep colour is for the cover, not the paragraphs: the hero and its title
 * panel carry the category family, then the body switches to a light
 * reading surface.
 */
export default function DeepDiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [question, setQuestion] = useState('');

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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero: the image when there is one, otherwise the category colour block. */}
        <View style={[styles.hero, { backgroundColor: hasImage(fact) ? panelColor : family.mid }]}>
          {hasImage(fact) && (
            <>
              <Image source={{ uri: fact.image.url }} style={styles.heroImage} contentFit="cover" />
              {/* A photo credit never leaves the image. It is a licence requirement. */}
              <View style={styles.credit}>
                <Text style={styles.creditText}>{fact.image.credit}</Text>
              </View>
            </>
          )}
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

        <View style={[styles.titlePanel, { backgroundColor: panelColor }]}>
          <Text style={[typeScale.eyebrow, { color: family.light }]}>
            {fact.category.toUpperCase()} · DEEP DIVE
          </Text>
          <Text style={[typeScale.headline, styles.title, { color: '#FFFFFF' }]}>{fact.fact}</Text>
          <VerifiedLine
            source={fact.source.name}
            url={fact.source.url}
            color={family.light}
            readTime={fact.deepDive.readTime}
          />
        </View>

        <View style={styles.body}>
          {fact.deepDive.body.map((para, i) => (
            <Text key={i} style={[typeScale.body, { color: colors.text }]}>
              {para}
            </Text>
          ))}

          {/* The signature block of every deep dive. */}
          <View style={[styles.callout, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>WHY IT MATTERS</Text>
            <Text style={[typeScale.body, { color: colors.text }]}>{fact.deepDive.whyItMatters}</Text>
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
      </ScrollView>

      {/* Ask about this. Phase 1 is UI only: send does nothing yet. */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView
          edges={['bottom']}
          style={[styles.ask, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
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
            <Pressable style={[styles.send, { backgroundColor: panelColor }]}>
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {shareView(<ShareCard fact={fact} onReady={onCardReady} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  missing: { padding: metrics.screenPadding },
  hero: { height: 200 },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.screenPadding,
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
