import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/auth';
import { AuthField } from '@/src/components/AuthField';
import {
  brandGreen,
  feedback,
  metrics,
  radius,
  spacing,
  type as typeScale,
  useTheme,
} from '@/src/theme';

type Mode = 'signUp' | 'signIn';

/*
  One screen for both, because the fields are the same and someone who
  tapped the wrong one should not have to go anywhere to fix it.
*/
const COPY: Record<
  Mode,
  { heading: string; body: string; action: string; switchPrompt: string; switchAction: string }
> = {
  signUp: {
    heading: 'Save your progress',
    body: 'An account keeps your streak, saved facts and quiz record, so a new phone or a reinstall picks up where you left off.',
    action: 'Create account',
    switchPrompt: 'Already have an account?',
    switchAction: 'Log in',
  },
  signIn: {
    heading: 'Welcome back',
    body: 'Log in to bring your streak, saved facts and quiz record onto this phone.',
    action: 'Log in',
    switchPrompt: 'New here?',
    switchAction: 'Create an account',
  },
};

/**
 * Sign in or create an account.
 *
 * A modal reached from the profile or settings, never a gate. §10 forbids
 * anything standing between a reader and the first fact, and this screen
 * only ever opens because someone asked for it.
 */
export default function SignInScreen() {
  const { colors } = useTheme();
  const auth = useAuth();

  const [mode, setMode] = useState<Mode>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const copy = COPY[mode];
  const canSubmit = email.trim().length > 0 && password.length > 0 && !auth.busy;

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  async function submit() {
    if (!canSubmit) return;
    setError('');
    setNotice('');

    if (mode === 'signUp') {
      const result = await auth.signUp(email, password);
      if (result.error !== undefined) {
        setError(result.error);
        return;
      }
      if (result.needsConfirmation) {
        setNotice(`Check ${email.trim()} for a confirmation link, then log in here.`);
        setMode('signIn');
        setPassword('');
        return;
      }
    } else {
      const result = await auth.signIn(email, password);
      if (result.error !== undefined) {
        setError(result.error);
        return;
      }
    }
    close();
  }

  async function forgot() {
    if (email.trim().length === 0) {
      setError('Type your email above first.');
      return;
    }
    setError('');
    const result = await auth.sendPasswordReset(email);
    if (result.error !== undefined) {
      setError(result.error);
      setNotice('');
    } else {
      setNotice(`A reset link is on its way to ${email.trim()}. Open it on this phone.`);
    }
  }

  function switchMode() {
    setMode(mode === 'signUp' ? 'signIn' : 'signUp');
    setError('');
    setNotice('');
  }

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={close}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={styles.close}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>

          <View style={styles.header}>
            <Text style={[typeScale.headline, { color: colors.text }]}>{copy.heading}</Text>
            <Text style={[typeScale.body, { color: colors.textMuted }]}>{copy.body}</Text>
          </View>

          <View style={styles.fields}>
            <AuthField
              label="EMAIL"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
            />
            <AuthField
              label="PASSWORD"
              value={password}
              onChangeText={setPassword}
              placeholder={mode === 'signUp' ? 'At least 6 characters' : 'Your password'}
              secure
              textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
              autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
              onSubmitEditing={() => void submit()}
              returnKeyType="go"
            />
          </View>

          {error.length > 0 && (
            <Text style={[typeScale.caption, { color: feedback.wrong }]}>{error}</Text>
          )}
          {notice.length > 0 && (
            <Text style={[typeScale.caption, { color: feedback.correct }]}>{notice}</Text>
          )}

          {mode === 'signUp' && (
            <View style={[styles.reassure, { backgroundColor: colors.surface }]}>
              <Ionicons name="phone-portrait-outline" size={16} color={colors.textMuted} />
              <Text style={[typeScale.caption, styles.flex, { color: colors.textMuted }]}>
                Everything already on this phone is kept and added to your account.
              </Text>
            </View>
          )}

          <View style={styles.spacer} />

          <Pressable
            onPress={() => void submit()}
            disabled={!canSubmit}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: brandGreen, opacity: !canSubmit ? 0.5 : pressed ? 0.85 : 1 },
            ]}>
            {auth.busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[typeScale.label, { color: '#FFFFFF' }]}>{copy.action}</Text>
            )}
          </Pressable>

          {mode === 'signIn' && (
            <Pressable onPress={() => void forgot()} hitSlop={8} style={styles.textButton}>
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>
                Forgot your password?
              </Text>
            </Pressable>
          )}

          <Pressable onPress={switchMode} hitSlop={8} style={styles.switchRow}>
            <Text style={[typeScale.caption, { color: colors.textMuted }]}>
              {copy.switchPrompt}{' '}
            </Text>
            <Text style={[typeScale.label, { color: brandGreen }]}>{copy.switchAction}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: metrics.screenPadding,
    gap: spacing.lg,
  },
  close: { alignSelf: 'flex-end' },
  header: { gap: spacing.sm, marginBottom: spacing.sm },
  fields: { gap: spacing.lg },
  reassure: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.tile,
  },
  spacer: { flex: 1, minHeight: spacing.xl },
  primary: {
    minHeight: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: { alignItems: 'center', paddingVertical: spacing.sm },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
