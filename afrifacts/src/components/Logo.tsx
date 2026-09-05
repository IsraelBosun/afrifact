import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { metrics } from '@/src/theme';

/**
 * The mark. A patterned Africa on the app's cream, corners rounded.
 *
 * The same drawing as the launcher icon and the Play Store listing, from
 * the same source file — `scripts/make-icons.js` cuts all of them at once,
 * so the mark on a shared card cannot drift from the one on the store
 * page. That matters more here than anywhere: every share is an ad, and an
 * ad carrying a different logo than the listing it points at is a worse
 * ad.
 *
 * SIZE
 *
 * It is drawn at 512 and rendered between 24 and 32, except on a share
 * card, which lays out at 360 and is captured at 1080 — so `size={30}`
 * there is 90px in the exported PNG, where the pattern reads clearly. At
 * 24 in the app the pattern is texture rather than detail and the
 * continent's outline is what identifies it, which is why the wordmark is
 * always beside it.
 *
 * The ground is baked into the PNG rather than set here. The mark sits on
 * category colour on share cards and on both neutrals in the app, and the
 * black outlines in the drawing disappear against a dark panel without it.
 */
export function Logo({ size = metrics.logoSize }: { size?: number }) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Image
        source={require('@/assets/images/logo-mark.png')}
        style={styles.image}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // The radius has to clip here rather than on the image: expo-image does
  // not round its own corners reliably across platforms.
  mark: { overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
