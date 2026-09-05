import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { metrics } from '@/src/theme';

/**
 * Bookmark, share, and the sparkle that opens the deep dive.
 * The sparkle is always the brightest element on the card, and it
 * appears on every fact.
 *
 * All three glyphs are the filled Ionicons, matching the design: the
 * bookmark is a solid ribbon, share is the three-node network, and the
 * sparkle is the four-point star. The sparkle also sits on a slightly
 * larger circle, so it reads as the primary action without needing a
 * label.
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
      <Pressable
        onPress={onSave}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Remove bookmark' : 'Save this fact'}
        style={[styles.btn, circle, { backgroundColor: buttonBg }]}>
        <Ionicons name="bookmark" size={19} color={tint} />
      </Pressable>

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
        <Ionicons name="sparkles" size={21} color={sparkleTint} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { gap: metrics.railGap },
  horizontal: { flexDirection: 'row', alignItems: 'center' },
  vertical: { flexDirection: 'column', alignItems: 'center' },
  btn: { alignItems: 'center', justifyContent: 'center' },
});
