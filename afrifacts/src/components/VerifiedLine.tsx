import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, type as typeScale } from '@/src/theme';

/**
 * Every fact carries a source and a verified badge. One viral screenshot
 * of a fake fact would undo months of work, so this is never optional.
 *
 * Given a `url` it becomes the way to check the claim: tapping it opens
 * the source in an in-app browser. That is the point of the badge — a
 * verified mark nobody can open is an assertion, not evidence — and it is
 * why the link lives here rather than on the photo credit, which answers
 * a different question (who owns the picture, not who backs the fact).
 *
 * Without a `url` it renders as plain text, which is what the share card
 * and any unsourced fact need.
 *
 * `compact` drops everything but the mark and the word. On a feed card
 * the source name was the longest thing in the footer and it competed
 * with the fact for attention — the badge's job there is to say the claim
 * is backed, not to name the backer. The name is still one tap away: the
 * line stays openable, and the deep dive prints it in full.
 */
export function VerifiedLine({
  source,
  color,
  readTime,
  url,
  compact = false,
}: {
  source: string;
  color: string;
  readTime?: number;
  /** When set, the line opens the source. */
  url?: string;
  /** Mark and the word 'Verified' only. */
  compact?: boolean;
}) {
  const label = (
    <>
      <Ionicons name="checkmark-circle-outline" size={14} color={color} />
      <Text style={[typeScale.caption, styles.text, { color }]} numberOfLines={2}>
        {compact ? 'Verified' : `Verified · ${source}${readTime ? ` · ${readTime} min` : ''}`}
      </Text>
    </>
  );

  const openable = typeof url === 'string' && url.trim().length > 0;

  if (!openable) {
    return <View style={styles.row}>{label}</View>;
  }

  return (
    <Pressable
      onPress={() => void WebBrowser.openBrowserAsync(url)}
      accessibilityRole="link"
      accessibilityLabel={`Check the source: ${source}`}
      // The card underneath advances on tap, so the touch target is kept to
      // the line itself. A generous hitSlop here would turn ordinary
      // swiping into accidental trips to a browser.
      hitSlop={4}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
      {label}
      <Ionicons name="open-outline" size={12} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  // Lets a long source name wrap or truncate inside the row instead of
  // pushing whatever sits beside it off the card.
  text: { flexShrink: 1 },
});
