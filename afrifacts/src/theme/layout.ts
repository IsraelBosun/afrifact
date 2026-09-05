/** Spacing, radii, and geometry measured from the design PDF. */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  pill: 999,
  chip: 10,
  card: 20,
  tile: 16,
  sheet: 24,
} as const;

/** Measured from the PDF, scaled to a 390dp phone. */
export const metrics = {
  /** Side margin for the feed card and most screen content. */
  screenPadding: 20,
  /** Category chip row. */
  chipHeight: 34,
  chipGap: 7,
  /** The circular buttons on the feed action rail. */
  railButton: 40,
  /** The sparkle is larger, so it reads as the card's primary action. */
  railSparkle: 46,
  railGap: 12,
  /** Logo mark in the top bar. */
  logoSize: 32,
  /** Country and streak pills in the top bar. */
  topPillHeight: 30,
  /**
   * Floor for the image on a photo card.
   *
   * The panel is content-sized and the image takes the remainder, so a very
   * long fact would otherwise squeeze the photograph to a sliver and the
   * card would stop being a photo card at all.
   */
  photoMinHeight: 150,
  /**
   * Floor for a tile in the Saved grid.
   *
   * Sized so a 390x844 screen shows six rather than eight: two columns and
   * a shade under three rows, once the header and the tab bar are out.
   * Bigger tiles are also more useful ones — at 150 a tile held a fragment
   * of its fact and every one of them had to be opened to be identified.
   */
  savedTileMinHeight: 210,
  /**
   * Content height of the tab bar, before the device's bottom inset is
   * added. Set explicitly because the default leaves the labels sitting on
   * the very edge of the screen on phones that report no bottom inset.
   */
  tabBarHeight: 60,
  /** Breathing room under the labels when the device reports no inset. */
  tabBarMinInset: 10,
  /**
   * Widest the feed card is allowed to be relative to its height (w/h).
   *
   * Without a cap the card stretches to fill whatever is left of a 20:9
   * phone, which reads as a long column rather than a card. Capping it and
   * centring what is left gives the card air above and below.
   */
  feedCardMaxAspect: 0.68,
} as const;

/** Share cards export at 1080x1350 (4:5), uncropped on WhatsApp, Instagram and X. */
export const shareCard = {
  width: 1080,
  height: 1350,
  aspectRatio: 1080 / 1350,
  /**
   * The card is laid out at this width and scaled up on capture, so the
   * same type scale and spacing tokens as the in-app card can be reused
   * and the export stays visually identical to what the user saw.
   */
  layoutWidth: 360,
  get scale() {
    return this.width / this.layoutWidth;
  },
  /** Inner padding, in layout units. */
  padding: 28,
  /**
   * Side margin for the fact and the footer on a fact share card.
   *
   * Tighter than `padding`, which the score card keeps — a score card
   * holds one numeral and wants the air, while a fact card holds up to
   * 296 characters and is read at thumbnail size in someone's feed. The
   * fact wants the width more than the card wants the margin.
   */
  textPadding: 20,
  /** Photo takes the top of the card, panel carries the text below. */
  photoRatio: 0.58,
  /** Floor for the photo, since the text block is now content-sized. */
  photoMinHeight: 150,
} as const;
