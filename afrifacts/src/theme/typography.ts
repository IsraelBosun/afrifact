/**
 * Type system, matched to the design PDF.
 *
 * Fraunces (serif) carries facts, headlines, and big numbers.
 * Poppins (sans) carries chips, labels, buttons, and article body.
 *
 * Note: the PDF uses Poppins, not Sora, and leans on Bold for chips and
 * labels. The screens are the source of truth, so this follows them.
 * Sizes below are PDF points scaled to a 390dp phone.
 */

import type { TextStyle } from 'react-native';

/** The names the fonts are registered under in app/_layout.tsx. */
export const fonts = {
  serif: 'Fraunces_400Regular',
  serifMedium: 'Fraunces_500Medium',
  sans: 'Poppins_400Regular',
  sansMedium: 'Poppins_500Medium',
  sansBold: 'Poppins_700Bold',
} as const;

export const type = {
  /** The fact on a typographic card. The largest thing in the app. */
  fact: {
    fontFamily: fonts.serif,
    fontSize: 29,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  /** The fact on a photo card, where the panel is shorter. */
  factSmall: {
    fontFamily: fonts.serif,
    fontSize: 23,
    lineHeight: 31,
    letterSpacing: -0.2,
  },
  /**
   * The fact on a typographic card when it is a long one.
   *
   * The design PDF's sample facts were short and the card was drawn for
   * them. Real corpus facts run to a median of 124 characters and a max
   * of 296, and at 29pt those fill the card edge to edge. This is the
   * bottom of the ladder, not a separate style.
   */
  factCompact: {
    fontFamily: fonts.serif,
    fontSize: 19,
    lineHeight: 27,
    letterSpacing: -0.1,
  },
  /**
   * The bottom of the fact ladder, for the longest facts on the narrowest
   * phones. On a 360dp screen a 296-character fact overflows its card at
   * every larger size — this is the step that makes it fit.
   */
  factTiny: {
    fontFamily: fonts.serif,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: 0,
  },
  /** Deep dive headline, quiz question. */
  headline: {
    fontFamily: fonts.serif,
    fontSize: 25,
    lineHeight: 33,
    letterSpacing: -0.2,
  },
  /** Score numerals and profile stat figures. */
  display: {
    fontFamily: fonts.serifMedium,
    fontSize: 76,
    lineHeight: 84,
    letterSpacing: -2,
  },
  /** Stat card figures on the profile grid. */
  statFigure: {
    fontFamily: fonts.serifMedium,
    fontSize: 30,
    lineHeight: 36,
  },
  /** Screen titles: "Saved", the profile name. */
  screenTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    lineHeight: 28,
  },
  /** Article paragraphs on the light reading surface. */
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 23,
  },
  /** Quiz answer options, country rows, list items. */
  option: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  /** Category chips, buttons, the wordmark. */
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    lineHeight: 18,
  },
  /** Source lines, photo credits, read time, quota pills. */
  caption: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 17,
  },
  /** Small tracked labels: "HISTORY", "WHY IT MATTERS", "DAY STREAK". */
  eyebrow: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
} as const satisfies Record<string, TextStyle>;

export type TypeToken = keyof typeof type;

/**
 * Pick a fact size from how long the fact is.
 *
 * A fact is the largest thing in the app, so a short one should be
 * dramatic. But the corpus is not made of short ones, and a 200-character
 * fact set at 29pt is a wall of serif with no room left for the source
 * line. Four steps, chosen against the real length distribution and
 * checked against the narrowest common phone: at 360dp the longest fact in
 * the corpus overflows its card at every size above the smallest.
 */
export function factTypeFor(fact: string, surface: 'card' | 'panel' = 'card'): TextStyle {
  // The photo card's panel is the smaller half of the card, so its ladder
  // starts a step down and drops sooner. Photo-card facts run to a median
  // of 136 characters, which at the full size would not fit at all.
  if (surface === 'panel') {
    if (fact.length <= 70) return type.factSmall;
    return fact.length <= 150 ? type.factCompact : type.factTiny;
  }
  if (fact.length <= 95) return type.fact;
  if (fact.length <= 175) return type.factSmall;
  return fact.length <= 230 ? type.factCompact : type.factTiny;
}
