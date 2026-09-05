import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionRail } from './ActionRail';
import { VerifiedLine } from './VerifiedLine';
import {
  factTypeFor,
  familyFor,
  metrics,
  radius,
  spacing,
  type as typeScale,
} from '@/src/theme';
import { hasImage, type Fact } from '@/src/types';

/**
 * One fact, filling the feed between the chips and the tab bar.
 *
 * Two variants, chosen by whether the fact carries an image:
 *  - Typographic: solid pastel fill from the category family, fact in large
 *    serif, action rail stacked vertically on the right.
 *  - Photo: image on top, solid dark panel below carrying text and a
 *    horizontal rail. The panel colour comes from the image.
 */
export function FactCard({
  fact,
  saved,
  onSave,
  onShare,
  onSparkle,
  onAdvance,
}: {
  fact: Fact;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onSparkle: () => void;
  onAdvance: () => void;
}) {
  const family = familyFor(fact.category);

  if (hasImage(fact)) {
    const panel = fact.image.panelColor;
    return (
      <Pressable style={[styles.card, { backgroundColor: panel }]} onPress={onAdvance}>
        <View style={styles.photoWrap}>
          <Image source={{ uri: fact.image.url }} style={styles.photo} contentFit="cover" />
          <View style={[styles.categoryPill, styles.pillOnPhoto]}>
            <Text style={[typeScale.eyebrow, { color: family.light }]}>
              {fact.category.toUpperCase()}
            </Text>
          </View>
          {/* Photo credit never leaves the card. It is a licence requirement. */}
          <View style={styles.credit}>
            <Text style={[typeScale.caption, styles.creditText]}>{fact.image.credit}</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={[factTypeFor(fact.fact, 'panel'), { color: '#FFFFFF' }]}>{fact.fact}</Text>
          <View style={styles.panelFooter}>
            <View style={styles.panelSource}>
              <VerifiedLine
                compact
                source={fact.source.name}
                url={fact.source.url}
                color={family.light}
              />
            </View>

            <ActionRail
              saved={saved}
              tint="#FFFFFF"
              buttonBg="rgba(255,255,255,0.14)"
              sparkleBg={family.light}
              sparkleTint={family.dark}
              onSave={onSave}
              onShare={onShare}
              onSparkle={onSparkle}
            />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={[styles.card, { backgroundColor: family.light }]} onPress={onAdvance}>
      <View style={styles.typoBody}>
        <View style={[styles.categoryPill, { backgroundColor: family.dark }]}>
          <Text style={[typeScale.eyebrow, { color: family.light }]}>
            {fact.category.toUpperCase()}
          </Text>
        </View>

        <View style={styles.typoFactWrap}>
          <Text style={[factTypeFor(fact.fact), { color: family.dark }]}>{fact.fact}</Text>
        </View>

        <VerifiedLine compact source={fact.source.name} url={fact.source.url} color={family.mid} />
      </View>

      <View style={styles.typoRail}>
        <ActionRail
          vertical
          saved={saved}
          tint={family.dark}
          buttonBg="rgba(255,255,255,0.55)"
          sparkleBg={family.dark}
          sparkleTint={family.light}
          onSave={onSave}
          onShare={onShare}
          onSparkle={onSparkle}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  // --- photo variant ---
  // The panel sizes to its own content and the image takes whatever is
  // left. The split used to be two fixed flex factors, which clipped the
  // fact whenever it was a long one — and real facts on photo cards run to
  // a median of 136 characters. A long fact now costs the photo some
  // height instead of losing its own last line.
  photoWrap: { flex: 1, minHeight: metrics.photoMinHeight },
  photo: { width: '100%', height: '100%' },
  pillOnPhoto: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.45)',
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
  panel: {
    // No flex: the panel is exactly as tall as its text needs, which is
    // what stops a sentence being truncated.
    //
    // Narrower side margins than the 24 this used to carry all round. The
    // panel is the smaller half of the card and its type ladder already
    // steps down at 70 and 150 characters, so every dp of width taken by
    // padding is paid for in font size. Vertical stays at 24 — that gap
    // is what separates the panel from the photograph above it.
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  // Source line and rail on one line, which is what the design asks for.
  // The overflow this used to cause was never the row: the three buttons
  // are a fixed 150dp and the source name is whatever Wikipedia calls the
  // article, and nothing told the name to give way. `panelSource` is what
  // makes it yield — it takes the space the rail does not need, and the
  // name wraps or truncates inside it instead of pushing the buttons off
  // the card.
  panelFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  panelSource: { flex: 1 },
  // --- typographic variant ---
  // A column: pill, then the fact taking whatever is left, then the source
  // line. The fact was previously absolute-positioned against a pinned
  // footer, which meant a long fact ran underneath both the source line and
  // the rail. In flow, it cannot.
  typoBody: { flex: 1, padding: spacing.xl, gap: spacing.lg },
  // The rail is a floating column on the right, so the fact reserves its
  // width. Without this gutter the buttons sit on top of the words.
  //
  // The gutter only has to clear the rail, and the rail is inset from the
  // card edge by spacing.lg while this sits inside typoBody's spacing.xl.
  // Reserving the full button width ignored that and left 8dp of empty
  // column beyond the buttons plus a gutter measured from the wrong edge.
  // Measured against the rail instead: the text now stops 8dp short of
  // the buttons rather than 16dp past them.
  typoFactWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: metrics.railSparkle - spacing.lg,
  },
  // Clear of the source line beneath it: its height plus a gap plus the
  // card's own bottom padding.
  typoRail: { position: 'absolute', right: spacing.lg, bottom: spacing.xl + 17 + spacing.md },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
});
