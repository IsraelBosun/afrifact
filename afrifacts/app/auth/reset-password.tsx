import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

import { parseRecoveryLink, useAuth } from '@/src/auth';
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

const MIN_PASSWORD = 6;

type Status = 'verifying' | 'ready' | 'done' | 'error';

/**
 * Where the password-reset email lands.
 *
 * expo-router routes `afrifacts://auth/reset-password#...` here. The
 * tokens in the fragment are read, installed as a short-lived session, and
 * the reader sets a new password under it.
 */
export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const auth = useAuth();
  const url = Linking.useURL();

  const [status, setStatus] = useState<Status>('verifying');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const { beginRecovery, signedIn } = auth;

  useEffect(() => {
    const link = parseRecoveryLink(url);
    if (link === null) return;
    if (link.type === 'error') {
      setError(link.message);
      setStatus('error');
      return;
    }
    void beginRecovery(link.accessToken, link.refreshToken).then((result) => {
      if (result.error !== undefined) {
        setError(result.error);
        setStatus('error');
      } else {
        setStatus('ready');
      }
    });
  }, [url, beginRecovery]);

  // Opened while already signed in, or the session landed before the
  // link was read: either way there is a session to change the password on.
  useEffect(() => {
    if (status === 'verifying' && signedIn) setStatus('ready');
  }, [signedIn, status]);

  const canSubmit = status === 'ready' && password.length > 0 && confirm.length > 0 && !auth.busy;

  async function submit() {
    if (!canSubmit) return;
    if (password.length < MIN_PASSWORD) {
      setError(`Passwords need at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('Those two passwords do not match.');
      return;
    }
    setError('');
    const result = await auth.completePasswordReset(password);
    if (result.error !== undefined) {
      setError(result.error);
      return;
    }
    setStatus('done');
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
          {status === 'verifying' && (
            <View style={styles.centred}>
              <ActivityIndicator color={brandGreen} />
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>
                Checking your reset link
              </Text>
            </View>
          )}

          {status === 'error' && (
            <View style={styles.centred}>
              <Ionicons name="alert-circle-outline" size={36} color={feedback.wrong} />
              <Text style={[typeScale.headline, styles.centreText, { color: colors.text }]}>
                That link did not work
              </Text>
              <Text style={[typeScale.body, styles.centreText, { color: colors.textMuted }]}>
                {error.length > 0 ? error : 'This reset link is no longer valid.'} Ask for a new
                one from the log in screen.
              </Text>
              <Pressable
                onPress={() => router.replace('/auth/sign-in')}
                style={[styles.primary, { backgroundColor: brandGreen }]}>
                <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Back to log in</Text>
              </Pressable>
            </View>
          )}

          {status === 'done' && (
            <View style={styles.centred}>
              <Ionicons name="checkmark-circle-outline" size={36} color={feedback.correct} />
              <Text style={[typeScale.headline, styles.centreText, { color: colors.text }]}>
                Password changed
              </Text>
              <Text style={[typeScale.body, styles.centreText, { color: colors.textMuted }]}>
                You are signed in, and your progress is on this phone.
              </Text>
              <Pressable
                onPress={() => router.replace('/')}
                style={[styles.primary, { backgroundColor: brandGreen }]}>
                <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Back to the facts</Text>
              </Pressable>
            </View>
          )}

          {status === 'ready' && (
            <>
              <View style={styles.header}>
                <Text style={[typeScale.headline, { color: colors.text }]}>Set a new password</Text>
                <Text style={[typeScale.body, { color: colors.textMuted }]}>
                  For {auth.email ?? 'your account'}.
                </Text>
              </View>

              <View style={styles.fields}>
                <AuthField
                  label="NEW PASSWORD"
                  value={password}
                  onChangeText={setPassword}
                  placeholder={`At least ${MIN_PASSWORD} characters`}
                  secure
                  textContentType="newPassword"
                  autoComplete="new-password"
                  returnKeyType="next"
                />
                <AuthField
                  label="TYPE IT AGAIN"
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="The same password"
                  secure
                  textContentType="newPassword"
                  autoComplete="new-password"
                  onSubmitEditing={() => void submit()}
                  returnKeyType="go"
                />
              </View>

              {error.length > 0 && (
                <Text style={[typeScale.caption, { color: feedback.wrong }]}>{error}</Text>
              )}

              <View style={styles.spacer} />

              <Pressable
                onPress={() => void submit()}
                disabled={!canSubmit}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.primary,
                  {
                    backgroundColor: brandGreen,
                    opacity: !canSubmit ? 0.5 : pressed ? 0.85 : 1,
                  },
                ]}>
                {auth.busy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[typeScale.label, { color: '#FFFFFF' }]}>Change password</Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, padding: metrics.screenPadding, gap: spacing.lg },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  centreText: { textAlign: 'center' },
  header: { gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.sm },
  fields: { gap: spacing.lg },
  spacer: { flex: 1, minHeight: spacing.xl },
  primary: {
    minHeight: 52,
    alignSelf: 'stretch',
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
});
