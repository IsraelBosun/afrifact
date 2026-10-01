import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/auth';
import { metrics, radius, spacing, type as typeScale, useTheme } from '@/src/theme';

/**
 * Settings. The account and the about box.
 *
 * Daily facts and appearance moved to the profile, where people already
 * look. This keeps what is changed rarely: signing in or out, and who
 * built the app.
 */

const DEVELOPER_NAME = 'Blue Hydra Labs';
const DEVELOPER_URL = 'http://bluehydralabs.com/';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.back, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[typeScale.screenTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AccountSection />

        <View style={styles.section}>
          <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>ABOUT</Text>
          <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.rowText}>
              <Text style={[typeScale.option, { color: colors.text }]}>AfriFacts</Text>
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>Version {version}</Text>
            </View>
          </View>

          {/* Opens in the system browser, the same way a fact's source does. */}
          <Pressable
            onPress={() => void WebBrowser.openBrowserAsync(DEVELOPER_URL)}
            accessibilityRole="link"
            accessibilityLabel={`Open ${DEVELOPER_NAME}`}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <Ionicons name="code-slash-outline" size={19} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={[typeScale.option, { color: colors.text }]}>Built by {DEVELOPER_NAME}</Text>
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>
                {DEVELOPER_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.textFaint} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Signed out: one row that opens the account screen. Signed in: who, and
 * the way out.
 *
 * Hidden entirely in a build with no Supabase configured, rather than
 * shown and broken.
 */
function AccountSection() {
  const { colors } = useTheme();
  const auth = useAuth();

  if (!auth.available || auth.loading) return null;

  function confirmSignOut() {
    Alert.alert(
      'Sign out?',
      'Your progress stays in your account. This phone starts fresh until you log in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => void signOut(false) },
      ],
    );
  }

  async function signOut(force: boolean) {
    const result = await auth.signOut(force);
    if (result.error === undefined || force) return;
    // Signing out wipes the phone, so an unsent run would be lost for
    // good. Say so, and let the reader decide.
    Alert.alert('Not backed up yet', result.error, [
      { text: 'Stay signed in', style: 'cancel' },
      { text: 'Sign out anyway', style: 'destructive', onPress: () => void signOut(true) },
    ]);
  }

  return (
    <View style={styles.section}>
      <Text style={[typeScale.eyebrow, { color: colors.textMuted }]}>ACCOUNT</Text>

      {auth.signedIn ? (
        <>
          <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="person-circle-outline" size={19} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={[typeScale.option, { color: colors.text }]} numberOfLines={1}>
                {auth.email ?? 'Signed in'}
              </Text>
              <Text style={[typeScale.caption, { color: colors.textMuted }]}>
                Your progress is backed up
              </Text>
            </View>
          </View>
          <Pressable
            onPress={confirmSignOut}
            disabled={auth.busy}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: auth.busy ? 0.5 : pressed ? 0.75 : 1,
              },
            ]}>
            <Ionicons name="log-out-outline" size={19} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={[typeScale.option, { color: colors.text }]}>Sign out</Text>
            </View>
          </Pressable>
        </>
      ) : (
        <Pressable
          onPress={() => router.push('/auth/sign-in')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <Ionicons name="cloud-upload-outline" size={19} color={colors.textMuted} />
          <View style={styles.rowText}>
            <Text style={[typeScale.option, { color: colors.text }]}>Save your progress</Text>
            <Text style={[typeScale.caption, { color: colors.textMuted }]}>
              Log in or create an account to keep your streak on any phone
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: metrics.screenPadding,
    paddingBottom: spacing.lg,
  },
  back: { marginLeft: -spacing.xs },
  scroll: {
    paddingHorizontal: metrics.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  section: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.tile,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowText: { flex: 1, gap: 2 },
});
