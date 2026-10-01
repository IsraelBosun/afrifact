import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  brandGreen,
  radius,
  spacing,
  THEME_PREFERENCES,
  type as typeScale,
  useTheme,
  type ThemePreference,
} from '@/src/theme';

const OPTIONS: Record<ThemePreference, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  system: { label: 'Phone', icon: 'phone-portrait-outline' },
  light: { label: 'Light', icon: 'sunny-outline' },
  dark: { label: 'Dark', icon: 'moon-outline' },
};

/**
 * Light, dark, or follow the phone, as one row of three.
 *
 * No preview and no confirm: every surface behind the control repaints on
 * the tap, which is the fastest way to find out whether you like it.
 */
export function ThemePicker() {
  const { colors, preference, setPreference } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>APPEARANCE</Text>
      <View style={styles.row}>
        {THEME_PREFERENCES.map((option) => {
          const { label, icon } = OPTIONS[option];
          const isSelected = option === preference;
          return (
            <Pressable
              key={option}
              onPress={() => setPreference(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option === 'system' ? 'Match my phone' : label}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? brandGreen : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <Ionicons name={icon} size={19} color={isSelected ? brandGreen : colors.textMuted} />
              <Text style={[typeScale.label, { color: colors.text }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  option: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.tile,
    paddingVertical: spacing.md,
  },
});
