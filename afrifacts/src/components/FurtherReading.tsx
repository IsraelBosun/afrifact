import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, type as typeScale, useTheme } from '@/src/theme';
import type { FurtherReadingLink } from '@/src/types';

/**
 * Where to go after the deep dive.
 *
 * The source link above answers "is this true"; this answers "tell me
 * more". Up to three articles about the people and events the fact
 * touches, chosen in the studio. The line under each title is the
 * article's own opening sentence, not something written for the app.
 *
 * Renders nothing when there are no links, which is the case for every
 * fact pushed before this existed, so an old row never shows an empty
 * heading. Links are filtered for a real https URL here too: the data
 * comes over the network, and a bad row should cost one link, not the
 * screen.
 */
export function FurtherReading({ links }: { links?: FurtherReadingLink[] }) {
  const { colors } = useTheme();

  const usable = (links ?? []).filter(
    (l) => typeof l?.title === 'string' && l.title.length > 0 && /^https:\/\//i.test(l?.url ?? ''),
  );
  if (usable.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>KEEP READING</Text>
      {usable.map((link) => (
        <Pressable
          key={link.url}
          onPress={() => void WebBrowser.openBrowserAsync(link.url)}
          accessibilityRole="link"
          accessibilityLabel={`Open ${link.title} on ${link.site || 'the web'}`}
          style={({ pressed }) => [
            styles.row,
            { borderColor: colors.border, backgroundColor: colors.background, opacity: pressed ? 0.7 : 1 },
          ]}>
          <View style={styles.text}>
            <Text style={[typeScale.option, { color: colors.text }]}>{link.title}</Text>
            {link.summary ? (
              <Text style={[typeScale.caption, { color: colors.textMuted }]} numberOfLines={2}>
                {link.summary}
              </Text>
            ) : null}
            <Text style={[typeScale.caption, { color: colors.textFaint }]}>{link.site}</Text>
          </View>
          <Ionicons name="open-outline" size={14} color={colors.textFaint} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: {
    borderWidth: 1,
    borderRadius: radius.tile,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: { flex: 1, gap: 2 },
});
