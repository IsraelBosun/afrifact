import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { brandGreen, radius, spacing, type as typeScale, useTheme } from '@/src/theme';

type Props = Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'keyboardType'
  | 'textContentType'
  | 'autoComplete'
  | 'onSubmitEditing'
  | 'returnKeyType'
> & {
  label: string;
  /** A password field, with a button to show what was typed. */
  secure?: boolean;
};

/**
 * One labelled field on the account screens.
 *
 * Passwords get a show button because a mistyped password on a phone
 * keyboard is the commonest way a sign-in fails, and hidden characters
 * give no way to see which one.
 */
export function AuthField({ label, secure = false, ...input }: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>{label}</Text>
      <View
        style={[
          styles.box,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? brandGreen : colors.border,
            borderWidth: focused ? 2 : 1,
          },
        ]}>
        <TextInput
          {...input}
          secureTextEntry={secure && !revealed}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.textFaint}
          style={[typeScale.body, styles.input, { color: colors.text }]}
        />
        {secure && (
          <Pressable
            onPress={() => setRevealed((r) => !r)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}>
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.tile,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  input: { flex: 1, paddingVertical: spacing.md },
});
