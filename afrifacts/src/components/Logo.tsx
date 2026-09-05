import { StyleSheet, Text, View } from 'react-native';

import { brandGreen, fonts, metrics } from '@/src/theme';

/** The rounded green square with an A. The one mark that never changes colour. */
export function Logo({ size = metrics.logoSize }: { size?: number }) {
  return (
    <View
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: size * 0.3, backgroundColor: brandGreen },
      ]}>
      <Text style={[styles.letter, { fontSize: size * 0.5 }]}>A</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: fonts.sansBold, color: '#FFFFFF' },
});
