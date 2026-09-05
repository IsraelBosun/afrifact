import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Logo } from './Logo';
import {
  factTypeFor,
  familyFor,
  fonts,
  radius,
  shareCard,
  spacing,
  type as typeScale,
} from '@/src/theme';
import { hasImage, type Fact } from '@/src/types';

/**
 * The exported share image, 1080x1350 (4:5), which displays uncropped on
 * WhatsApp status, Instagram and X.
 *
 * It is laid out at `shareCard.layoutWidth` and captured with a scale
 * factor, so it reuses the same type and spacing tokens as the in-app
 * card and the export stays visually identical to what the user saw.
 *
 * Every share is an ad: the logo mark, the app name, and the Play Store
 * line are part of the card, not an afterthought. The photo credit is on
 * the exported image too, which is both a licence requirement and a
 * trust signal.
 *
 * `onReady` fires when the card is actually safe to snapshot — after the
 * photograph has decoded, or immediately when there is none. Capturing
 * before that produced the worst bug this component has had: the card was
 * retargeted at a new fact, the old bitmap was still on screen, and the
 * export went out with one fact's words over another fact's photograph.
 */
export function ShareCard({ fact, onReady }: { fact: Fact; onReady?: () => void }) {
  const family = familyFor(fact.category);
  const withImage = hasImage(fact);
  const panel = withImage ? fact.image.panelColor : family.dark;

  // Photo cards carry white text on the dark panel; typographic cards use
  // the dark stop of their own family on the light fill. Never black.
  const surface = withImage ? panel : family.light;
  const textColor = withImage ? '#FFFFFF' : family.dark;
  const mutedColor = withImage ? family.light : family.mid;

  // With no photograph there is nothing to wait for; the card is ready as
  // soon as it has laid out.
  useEffect(() => {
    if (!withImage) onReady?.();
  }, [withImage, fact.id, onReady]);

  return (
    <View style={[styles.card, { backgroundColor: surface }]}>
      {withImage ? (
        <View style={styles.photoWrap}>
          <Image
            // Keyed by url so a retarget mounts a fresh view instead of
            // holding the previous fact's decoded bitmap.
            key={fact.image.url}
            recyclingKey={fact.image.url}
            source={{ uri: fact.image.url }}
            style={styles.photo}
            contentFit="cover"
            // Fires on success and on failure alike. A card that cannot
            // load its photo must still be shareable, not hung.
            onLoadEnd={onReady}
          />
          <View style={[styles.pill, styles.pillOnPhoto]}>
            <Text style={[typeScale.eyebrow, { color: '#FFFFFF' }]}>
              {fact.category.toUpperCase()}
            </Text>
          </View>
          {/* A photo credit never leaves the export. */}
          <View style={styles.credit}>
            <Text style={styles.creditText}>{fact.image.credit}</Text>
          </View>
        </View>
      ) : null}

      <View style={[styles.body, withImage ? styles.bodyWithPhoto : styles.bodyAlone]}>
        {!withImage && (
          <View style={[styles.pill, { backgroundColor: family.dark }]}>
            <Text style={[typeScale.eyebrow, { color: family.light }]}>
              {fact.category.toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={[factTypeFor(fact.fact, withImage ? 'panel' : 'card'), { color: textColor }]}>
          {fact.fact}
        </Text>

        <View style={styles.sourceRow}>
          <Ionicons name="checkmark-circle-outline" size={15} color={mutedColor} />
          <Text style={[typeScale.caption, { color: mutedColor }]}>
            Verified · {fact.source.name}
          </Text>
        </View>
      </View>

      {/* Footer. Every share carries the mark, the name, and the store line. */}
      <View style={[styles.footer, { borderTopColor: withImage ? 'rgba(255,255,255,0.15)' : family.mid + '33' }]}>
        <View style={styles.brand}>
          <Logo size={30} />
          <View>
            <Text style={[styles.wordmark, { color: textColor }]}>AfriFacts</Text>
            <Text style={[typeScale.caption, { color: mutedColor, fontSize: 10 }]}>
              Fact #{fact.factNumber}
            </Text>
          </View>
        </View>

        <View style={styles.store}>
          <Ionicons name="logo-google-playstore" size={13} color={mutedColor} />
          <Text style={[typeScale.caption, { color: mutedColor, fontSize: 11 }]}>
            Get it on Google Play
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: shareCard.layoutWidth,
    height: shareCard.layoutWidth / shareCard.aspectRatio,
    overflow: 'hidden',
  },
  // The photo takes what the text leaves, rather than a fixed share of the
  // card. Fixed flex factors clipped long facts mid-sentence on the export
  // — the same bug the in-app photo card had.
  photoWrap: { flex: 1, minHeight: shareCard.photoMinHeight },
  photo: { width: '100%', height: '100%' },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pillOnPhoto: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  credit: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.chip,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  creditText: { fontFamily: fonts.sansMedium, fontSize: 10, color: '#FFFFFF' },
  body: {
    paddingHorizontal: shareCard.padding,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  // No flex: exactly as tall as the fact needs.
  bodyWithPhoto: { paddingVertical: spacing.lg },
  bodyAlone: { flex: 1 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: shareCard.padding,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wordmark: { fontFamily: fonts.sansBold, fontSize: 15 },
  store: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
