import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, type as typeScale, useTheme } from '@/src/theme';
import type { Source } from '@/src/types';

/**
 * The source, as something a reader can actually open.
 *
 * The verified badge appears on every card, but until this existed the URL
 * behind it was carried in the data and never shown — a claim of evidence
 * with no way to check it. The whole trust premise (CLAUDE.md §1) rests on
 * a challenged fact being answerable in under a minute, and that is only
 * true if the reader can reach the source themselves.
 *
 * Opens in an in-app browser rather than handing the reader to Chrome:
 * checking a source should cost a tap and a back gesture, not the session.
 */
export function SourceLink({ source }: { source: Source }) {
  const { colors } = useTheme();

  const hasUrl = source.url.trim().length > 0;

  // The bare host is the honest short label — it says where the reader is
  // about to be sent, which a title alone does not.
  const host = hasUrl
    ? source.url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0]
    : '';

  const open = () => {
    if (!hasUrl) return;
    void WebBrowser.openBrowserAsync(source.url);
  };

  const body = (
    <>
      <View style={styles.head}>
        <Ionicons
          name={source.verified ? 'checkmark-circle' : 'ellipse-outline'}
          size={15}
          color={colors.textMuted}
        />
        <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>
          {source.verified ? 'VERIFIED SOURCE' : 'SOURCE'}
        </Text>
      </View>

      <Text style={[typeScale.option, { color: colors.text }]}>{source.name}</Text>

      {hasUrl && (
        <View style={styles.foot}>
          <Text style={[typeScale.caption, { color: colors.textFaint }]} numberOfLines={1}>
            {host}
          </Text>
          <Ionicons name="open-outline" size={14} color={colors.textFaint} />
        </View>
      )}
    </>
  );

  if (!hasUrl) {
    return (
      <View style={[styles.box, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      onPress={open}
      accessibilityRole="link"
      accessibilityLabel={`Open the source: ${source.name}`}
      style={({ pressed }) => [
        styles.box,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.tile,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  foot: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
});
