import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { brandGreen, metrics } from '@/src/theme';

/**
 * Bookmark, share, and the button that opens the deep dive. That third
 * one is always the brightest element on the card, and it appears on
 * every fact.
 *
 * WHY IT IS NOT A SPARKLE
 *
 * It was, and the sparkle read as an AI button, because that is what a
 * four-point star means everywhere else now. What it actually opens is a
 * written article with a source on it — the opposite of the promise the
 * glyph was making. `reader` says the true thing, and it leaves the
 * sparkle to the one control in the app that has earned it: "Ask about
 * this" on the deep dive, which really is the model.
 *
 * All three glyphs are the filled Ionicons, matching the design: a solid
 * bookmark ribbon, the three-node share network, and a filled reader. The
 * reader also sits on a slightly larger circle, so it reads as the
 * primary action without needing a label.
 */
export function ActionRail({
  vertical = false,
  saved = false,
  tint,
  buttonBg,
  sparkleBg,
  sparkleTint,
  onSave,
  onShare,
  onSparkle,
}: {
  vertical?: boolean;
  saved?: boolean;
  /** Icon colour for bookmark and share. */
  tint: string;
  /** Fill behind bookmark and share. */
  buttonBg: string;
  sparkleBg: string;
  sparkleTint: string;
  onSave: () => void;
  onShare: () => void;
  onSparkle: () => void;
}) {
  const size = metrics.railButton;
  const circle = { width: size, height: size, borderRadius: size / 2 };
  const sparkleSize = metrics.railSparkle;
  const sparkleCircle = {
    width: sparkleSize,
    height: sparkleSize,
    borderRadius: sparkleSize / 2,
  };

  return (
    <View style={[styles.rail, vertical ? styles.vertical : styles.horizontal]}>
      <SaveButton saved={saved} tint={tint} buttonBg={buttonBg} circle={circle} onPress={onSave} />

      <Pressable
        onPress={onShare}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Share this fact"
        style={[styles.btn, circle, { backgroundColor: buttonBg }]}>
        <Ionicons name="share-social" size={19} color={tint} />
      </Pressable>

      <Pressable
        onPress={onSparkle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Read the deep dive"
        style={[styles.btn, sparkleCircle, { backgroundColor: sparkleBg }]}>
        <Ionicons name="reader" size={21} color={sparkleTint} />
      </Pressable>
    </View>
  );
}

/**
 * The bookmark, which now looks different when it is one.
 *
 * It did not before: `saved` reached this component and was spent entirely
 * on the accessibility label, so the glyph was the same filled ribbon in
 * the same colour whether or not the fact was kept. Tapping it appeared to
 * do nothing, which is most of why saving felt broken.
 *
 * Saved is the filled ribbon in brand green — the colour this app already
 * uses for every "yes, that one": the active tab, a correct answer, the
 * chosen country, the chosen theme. Unsaved is the outline in the card's
 * own tint, so an untouched rail still belongs to its colour family.
 *
 * The pop fires on the way in and not on the way out. Saving is the
 * moment worth marking; un-saving is a correction, and animating a
 * correction reads as the app congratulating you for changing your mind.
 */
function SaveButton({
  saved,
  tint,
  buttonBg,
  circle,
  onPress,
}: {
  saved: boolean;
  tint: string;
  buttonBg: string;
  circle: ViewStyle;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  // Seeded with the value it mounted at, so arriving on a fact that is
  // already saved is not treated as the act of saving it.
  const wasSaved = useRef(saved);

  useEffect(() => {
    if (saved && !wasSaved.current) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.35,
          duration: 130,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // A spring back rather than a second timing: it overshoots
        // slightly under 1 and settles, which is what makes it read as a
        // press landing rather than a resize.
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    wasSaved.current = saved;
  }, [saved, scale]);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={saved ? 'Remove bookmark' : 'Save this fact'}
      style={[styles.btn, circle, { backgroundColor: buttonBg }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={saved ? 'bookmark' : 'bookmark-outline'}
          size={19}
          color={saved ? brandGreen : tint}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: { gap: metrics.railGap },
  horizontal: { flexDirection: 'row', alignItems: 'center' },
  vertical: { flexDirection: 'column', alignItems: 'center' },
  btn: { alignItems: 'center', justifyContent: 'center' },
});
