import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Logo } from './Logo';
import {
  amber,
  categoryColors,
  fonts,
  radius,
  shareCard,
  spacing,
  type as typeScale,
} from '@/src/theme';

/**
 * The quiz score as an exported image, same 1080x1350 as the fact card.
 *
 * This is the viral mechanic: the streak badge, the run of check marks,
 * and "Think you can beat me?" in five words. Low scores stay playful,
 * never shaming, because nobody shares a card that embarrasses them.
 */
export function ScoreShareCard({
  score,
  total,
  title,
  results,
  streak,
}: {
  score: number;
  total: number;
  title: string;
  /** One entry per question, true when answered correctly. */
  results: boolean[];
  streak: number;
}) {
  // The card is a fixed 1080 wide, so twenty marks in a fixed-size row
  // would run past its edge. They shrink and wrap instead, which keeps the
  // export identical in shape to the score screen it mirrors.
  const markSize = results.length <= 5 ? 38 : results.length <= 10 ? 30 : 22;

  const family = categoryColors.Culture;

  return (
    <View style={[styles.card, { backgroundColor: family.dark }]}>
      <View style={styles.top}>
        <View style={styles.brand}>
          <Logo size={30} />
          <Text style={[styles.wordmark, { color: '#FFFFFF' }]}>AfriFacts</Text>
        </View>

        <View style={[styles.streak, { backgroundColor: amber.dark }]}>
          <Ionicons name="flame" size={13} color={amber.light} />
          <Text style={[typeScale.caption, { color: amber.light }]}>{streak}</Text>
        </View>
      </View>

      <View style={styles.middle}>
        <Text style={[typeScale.eyebrow, { color: family.light }]}>QUIZ SCORE</Text>

        <Text style={[styles.score, { color: '#FFFFFF' }]}>
          {score}/{total}
        </Text>

        <Text style={[styles.title, { color: family.light }]}>{title}</Text>

        <View style={styles.marks}>
          {results.map((correct, i) => (
            <View
              key={i}
              style={[
                styles.mark,
                {
                  width: markSize,
                  height: markSize,
                  borderRadius: markSize / 2,
                  backgroundColor: correct ? family.mid : 'rgba(255,255,255,0.12)',
                },
              ]}>
              <Ionicons
                name={correct ? 'checkmark' : 'close'}
                size={Math.round(markSize * 0.45)}
                color={correct ? '#FFFFFF' : family.light}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={[styles.challenge, { color: '#FFFFFF' }]}>Think you can beat me?</Text>

        <View style={styles.store}>
          <Ionicons name="logo-google-playstore" size={13} color={family.light} />
          <Text style={[typeScale.caption, { color: family.light, fontSize: 11 }]}>
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
    padding: shareCard.padding,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wordmark: { fontFamily: fonts.sansBold, fontSize: 15 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  middle: { alignItems: 'center', gap: spacing.md },
  score: { fontFamily: fonts.serifMedium, fontSize: 96, lineHeight: 106, letterSpacing: -3 },
  title: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 32, textAlign: 'center' },
  marks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  mark: { alignItems: 'center', justifyContent: 'center' },
  bottom: { alignItems: 'center', gap: spacing.md },
  challenge: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 28 },
  store: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
